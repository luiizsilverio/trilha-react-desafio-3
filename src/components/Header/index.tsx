import styles from './header.module.scss'
import commonStyles from '../../styles/common.module.scss'
import Link from 'next/link'

export default function Header() {
  return (
    <header className={commonStyles.container}>
        <div className={styles.headerContainer}>
          <Link href={`/`}>
            <a>
              <img src="/logo.png" alt="" />
              <img src="/spacetraveling.png" alt="logo" />
              <img src="/ponto.png" alt="" />
            </a>
          </Link>
        </div>
    </header>
  )
}
