import { GetStaticProps } from 'next';
import Link from 'next/link'
import { useState } from 'react'
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom'
import { FiCalendar, FiUser } from "react-icons/fi";

import { getPrismicClient } from '../services/prismic';
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import Header from '../components/Header';
import { formatDate } from '../services/formatDate';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState(postsPagination.results)
  const [nextPag, setNextPag] = useState(postsPagination.next_page)

  async function carregarMais() {
    const response = await fetch(nextPag)
    const data = await response.json()

    const newPosts = data.results.map(post => (
      {
        uid: post.uid,
        first_publication_date: post.first_publication_date,
        data: {
          title: post.data.title,
          subtitle: post.data.subtitle,
          author: post.data.author
        }
      }
    ))

    setPosts(oldState => [...oldState, ...newPosts])
    setNextPag(oldState => data.next_page)
  }

  return (
    <>
      <Header />

      <main className={commonStyles.container}>
        <div className={styles.posts}>

          { posts.map(post => (
            <Link href={`/post/${ post.uid }`} key={ post.uid }>
              <a className={styles.postPreview}>
                <strong>{ post.data.title }</strong>
                <p>{ post.data.subtitle }</p>
                <span>
                  <time>
                    <FiCalendar />
                    { formatDate(post.first_publication_date) }
                  </time>
                  <span>
                    <FiUser />
                    <p>{ post.data.author }</p>
                  </span>
                </span>
              </a>
            </Link>
          )) }

          {nextPag && (
            <button
              onClick={carregarMais}
              type="button"
              className={styles.maisPosts}>
                Carregar mais posts
            </button>
          )}

        </div>
      </main>
    </>
  )
}

export const getStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [
      Prismic.predicates.at('document.type', 'posts')
    ],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 20, //limite de posts
    }
  )

  const posts = postsResponse.results.map(post => {

    //const first_publication_date = FormatDate(post.first_publication_date)
    //console.log(JSON.stringify(post.data, null, 2))

    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })

  return {
    props: {
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      }
    },
    revalidate: 60 * 30, // recarrega a cada 30 minutos
  }
};
