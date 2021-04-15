import { GetStaticPaths, GetStaticProps } from 'next';
import Link from 'next/link'
import { useState, useMemo } from 'react';
import { FiCalendar, FiUser, FiClock } from "react-icons/fi";
import { RichText } from 'prismic-dom'
import Prismic from '@prismicio/client'
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';

import { getPrismicClient } from '../../services/prismic';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { formatDate } from '../../services/formatDate'

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

function tempoLeitura(content) {
  // 1) somar a quantidade de palavras
  // 2) dividir por 200, que é a média que uma pessoa lê por minuto.
  // 3) arredondar para cima

  if (!content) {
    return 1
  }

  const tempoTotal = content.reduce((acc, content) => {
    const qtBody = RichText.asText(content.body).split(' ')
    //const qtHead = content.heading.split(' ')

    return acc + qtBody.length //+ qtHead.length
  }, 0);

  return Math.ceil(tempoTotal / 200)
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <p>Carregando...</p>;
  }

  return (
    <>
      <Header />

      <div className={styles.banner}>
        <img src={ post.data.banner.url || "/banner.png" } alt="Banner"/>
      </div>

      <main className={commonStyles.container}>
        <article className={styles.post}>
          <h1>{ post.data.title }</h1>

          <span>
            <time>
              <FiCalendar />
              { formatDate(post.first_publication_date) }
            </time>
            <FiUser />
            <p>{ post.data.author }</p>
            <FiClock />
            <p>{ `${tempoLeitura(post.data.content)} min` }</p>
          </span>

          {post.data.content.map(content => (
            <div key={ content.heading }
              className={styles.postContent}
            >
              <strong>{ content.heading }</strong>
              <div
                dangerouslySetInnerHTML={{__html: RichText.asHtml(content.body)}}
              />
            </div>
          ))}

        </article>
      </main>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query(
    [
      Prismic.predicates.at('document.type', 'posts')
    ],
    {
      fetch: ['posts.uid'],
      pageSize: 50, //limite de posts
    }
  )

  const paths = posts.results.map(post => (
    { params: { slug: post.uid } }
  ))

  return {
    paths,
    fallback: true
  }
};

export const getStaticProps = async ({ params }) => {
  const { slug } = params

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  const container = response.data.content || []
  //const first_publication_date = FormatDate(response.first_publication_date)

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url,
      },
      author: response.data.author,
      content: container,
    }
  }

  return {
    props: { post },
    redirect: 60 * 30 // recarrega a cada 30 minutos
  }
};
