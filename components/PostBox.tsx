import { useSession } from "next-auth/react";
import React, { useState } from "react";
import Avatar from "./Avatar";
import { LinkIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { useForm } from "react-hook-form";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { ADD_POST, ADD_SUBREDDIT } from "../graphql/mutations";
import { GET_ALL_POSTS, GET_SUBREDDIT_BY_TOPIC } from "../graphql/queries";
import toast from "react-hot-toast";
// import client from '@apollo/client'

type FormData = {
  postTitle: string;
  postBody: string;
  postImage: string;
  subreddit: string;
};

type Props = {
  subreddit?: string
}

function PostBox({subreddit}: Props) {
  const client = useApolloClient();
  const { data: session } = useSession();
  const [addPost] = useMutation(ADD_POST,{
    refetchQueries: [
      GET_ALL_POSTS,
      "postList"
    ]
  });
  const [addSubreddit] = useMutation(ADD_SUBREDDIT);
  
  const [imageBoxOpen, setImageBoxOpen] = useState<boolean>(false);
  const {
    register,
    setValue,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>();
  const onSubmit = handleSubmit(async (formData) => {
    const notification = toast.loading("creating new post...")
    
    console.log(formData)
    try{
      // query for the subreddit topic
      const { data: { subredditListByTopic } } = await client.query({
        query: GET_SUBREDDIT_BY_TOPIC,
        variables: {
          topic: subreddit || formData.subreddit,
        },
      });
      const subredditExists = subredditListByTopic.length > 0;
      if(!subredditExists){
        //create subreddit
        console.log("subreddit is new -> creating new subreddit")
        const {data: {insertSubreddit: newSubreddit}} = await addSubreddit({
          variables:{
            topic: formData.subreddit
          }
        })
        

        console.log("creating post...", formData)
        const image = formData.postImage || ''

        const {data: {insertPost: newPost}} = await addPost({
          variables: {
            body: formData.postBody,
            image: image,
            subreddit_id: newSubreddit.id,
            title: formData.postTitle,
            username: session?.user?.name


          }
        })
        console.log("new post added", newPost)
      }else{
        // use existing subreddit
        console.log("using existing subreddit")
        console.log(subredditListByTopic)
        const image = formData.postImage || ''
        const {data: {insertPost: newPost}}= await addPost({
          variables:{
            body: formData.postBody,
            image: image,
            subreddit_id: subredditListByTopic[0].id,
            title: formData.postTitle,
            username: session?.user?.name
          }
        })
        console.log("new post was added", newPost)
      }
      // After adding post
      setValue('postBody','')
      setValue('postImage','')
      setValue('postTitle','')
      setValue('subreddit','')
      toast.success('new post created', {
        id: notification
      })
    }catch(error){
      console.error("error", error)
      toast.error('something went wrong', {
        id: notification
      })
    }
  })
  return (
    <form onSubmit={onSubmit} className="sticky top-16 z-50 bg-white border rounded-md border-gray-300 p-2">
      <div className="flex items-center space-x-3">
        <Avatar />

        <input
          type="text"
          {...register("postTitle", { required: true })}
          className="flex-1 bg-gray-50 rounded-md p-2 pl-5 outline-none"
          disabled={!session}
          placeholder={
            session ? subreddit ? `create a post in r/${subreddit}`: "Create a post by entering title" : "Sign in to post"
          }
        />

        <PhotoIcon
          onClick={() => setImageBoxOpen(!imageBoxOpen)}
          className={`h-6 cursor-pointer text-gray-300 ${
            imageBoxOpen && "text-blue-300"
          }`}
        />
        <LinkIcon className={`h-6 text-gray-300`} />
      </div>
      {!!watch("postTitle") && (
        <div className="flex flex-col py-2">
          <div className="flex items-center px-2">
            <p className="min-w-[90px]">Body:</p>
            <input
              type="text"
              className="m-2 flex-1 bg-blue-50 p-2 outline-none"
              {...register("postBody")}
              placeholder="text (optional)"
            />
          </div>

          {!subreddit && (

          <div className="flex items-center px-2">
            <p className="min-w-[90px]">Subreddit:</p>
            <input
              type="text"
              className="m-2 flex-1 bg-blue-50 p-2 outline-none"
              {...register("subreddit", { required: true })}
              placeholder="the subreddit..."
            />
          </div>
          )}

          {imageBoxOpen && (
            <div className="flex items-center px-2">
              <p className="min-w-[90px]">Image Url:</p>
              <input
                type="text"
                className="m-2 flex-1 bg-blue-50 p-2 outline-none"
                {...register("postImage")}
                placeholder="Optional Image..."
              />
            </div>
          )}
          {Object.keys(errors).length > 0 && (
            <div className="space-y-2 p-2 text-red-500">
              {errors.postTitle?.type === "required" && (
                <p>A post title is required</p>
              )}

              {errors.subreddit?.type === "required" && (
                <p>A post title is required</p>
              )}
            </div>
          )}
          {!!watch('postTitle') && <button type="submit" className="w-full rounded-full bg-blue-400 p-2 text-white">Create Post</button>}
        </div>
      )}
    </form>
  );
}

export default PostBox;
