import type { NextPage } from 'next'
import Head from 'next/head'
import PostBox from '../components/PostBox'
import Feed from '../components/Feed'
import { useQuery } from '@apollo/client'
import { GET_SUBREDDIT_WITH_LIMIT } from '../graphql/queries'
import SubredditRow from '../components/SubredditRow'

const Home: NextPage = () => {
  const {data} = useQuery(GET_SUBREDDIT_WITH_LIMIT, {
    variables:{
      limit: 8
    }
  })

  const subreddits:Subreddit[] = data?.subredditListLimit
  return (
    <div className="my-7 mx-auto max-w-5xl ">
      <Head>
        <title>Reddit Clone</title>
      </Head>
      <PostBox />

      <div className='flex'>
        <div  className='flex-1'>

        <Feed />
        </div>
        <div className='sticky top-36 hidden mx-5 mt-5 h-fit min-w-[300px] rounded-md border border-gray-300 bg-white lg:inline'>
          <p className='text-md mb-1 p-4 pb-3 font-bold'>Top Communities</p>
          <div>
            {subreddits?.map((subreddit,i) => (
              <SubredditRow key={subreddit.id} topic={subreddit.topic} index={i} />
            ))}
          </div>
        </div>
      </div>

      


    </div>
  )
}

export default Home

//chumphon
//chumphon::stepzen.io+1000::5b0a2941cb5c1c828d1ee942537f30c2a744ef48e5b96e0c3afdc8f185706c4c
//chumphon::stepzen.net+1000::35b4b5194577093d94cfa050feb2679285630a4ba6bfb9f4c47600dd65525d2b
