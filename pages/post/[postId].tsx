import { useMutation, useQuery } from '@apollo/client'
import { useRouter } from 'next/router'
import React from 'react'
import { GET_POST_BY_POST_ID } from '../../graphql/queries'
import Post from '../../components/Post'
import { useSession } from 'next-auth/react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { ADD_COMMENT } from '../../graphql/mutations'
import toast from 'react-hot-toast'
import Avatar from '../../components/Avatar'
import Timeago from 'react-timeago'


type FormData = {
    comment: string
}


type Post = {
  body: string;
  created_at: string;
  id: number;
  image: string;
  subreddit_id: number;
  title: string;
  username: string;
  vote: Vote[];
  comment: Comment[];
  subreddit: Subreddit[];
};

type Comment = {
  created_at: string;
  id: number;
  post_id: number;
  text: string;
  username: string;
};

function PostPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [addComment] = useMutation(ADD_COMMENT, {
    refetchQueries: [GET_POST_BY_POST_ID, "postListByPostId"],
  });
  const { data } = useQuery(GET_POST_BY_POST_ID, {
    variables: {
      post_id: router.query.postId,
    },
  });

  const post: Post = data?.postListByPostId;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>();
  console.log("data is served", data);
  const onSubmit: SubmitHandler<FormData> = async (data) => {
    // post comment here
    console.log(data);
    const notification = toast.loading("posting your comment...");

    await addComment({
      variables: {
        post_id: router.query.postId,
        username: session?.user?.name,
        text: data.comment,
      },
    });

    setValue("comment", "");
    toast.success("comment successfully posted!", {
      id: notification,
    });
  };
  console.log(data);
  return (
    <div className="mx-auto my-7 max-w-5xl">
      <Post post={post} />
      <div className="-mt-1 rounded-b-md border border-t-0 border-gray-300 bg-white p-5 pl-16">
        <p className="text-sm">
          Comment as <span className="text-red-500">{session?.user?.name}</span>
        </p>

        <form
          className="flex flex-col space-y-2"
          onSubmit={handleSubmit(onSubmit)}
        >
          <textarea
            {...register("comment")}
            disabled={!session}
            className="h-24 rounded-md border border-gray-200 p-2 pl-4 outline-none disabled:bg:gray-50"
            placeholder={
              session ? "what are your thoughts" : "please sign in to comment"
            }
          />
          <button
            type="submit"
            className="rounded-full bg-red-500 p-3 font-semibold text-white disabled:bg-gray-200"
            disabled={!session}
          >
            Comment
          </button>
        </form>
      </div>

      <div className="-my-5 rounded-b-md border-t-0 border-gray-300 bg-white py-5 px-10">
        <hr className="py-2" />
        {post?.comment?.map((comment) => (
          <div
            className="relative flex items-center space-x-2 space-y-5"
            key={comment.id}
          >
            <hr className="absolute top-10 h-16 border left-7 z-0" />
            <div className="z-50">
              <Avatar seed={comment.username} />
            </div>

            <div className="flex flex-col">
              <p className="py-2 text-xs text-gray-400">
                <span className="font-semibold text-gray-600">
                  {comment.username}
                  <Timeago date={comment.created_at} />
                </span>
              </p>
              <p>{comment.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PostPage