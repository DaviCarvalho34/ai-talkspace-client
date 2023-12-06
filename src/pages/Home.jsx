import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  CustomButton,
  EditProfile,
  FriendsCard,
  Loading,
  PostCard,
  ProfileCard,
  TextInput,
  TopBar,
} from "../components";

import { Link } from "react-router-dom";
import { NoProfile } from "../assets";
import { BsFiletypeGif, BsPersonFillAdd } from "react-icons/bs";
import { BiImages, BiSolidVideo } from "react-icons/bi";
import { useForm } from "react-hook-form";
import { apiRequest, deletePost, fetchPosts, getUserInfo, handleAiResponse, handleFileUpload, likePost, sendFriendRequest } from "../utils";
import { UserLogin } from "../redux/userSlice";

const Home = () => {
  const { user, edit } = useSelector((state) => state.user);
  const { posts }  = useSelector(state => state.posts);
  const [friendRequest, setFriendRequest] = useState([]);
  const [suggestedFriends, setSuggestedFriends] = useState([]);
  const [errMsg, setErrMsg] = useState("");
  const [file, setFile] = useState(null);
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,reset,
    formState: { errors },
  } = useForm();

  const handlePostSubmit = async (data) => {
    setPosting(true);

    try {
      const uri = file && (await handleFileUpload(file));
      const newData = uri ? { ...data, image: uri } : data;

      const res = await apiRequest({
        url: "/posts/create-post",
        data: newData,
        token: user?.token,
        method: "POST",
      });

      reset({
        description: "",
      })
      setFile(null);
      setErrMsg("");
      await fetchPost();

      setPosting(false);

      await handleAiResponse(res?.data?._id, data.description);

    } catch (error) {
      console.log(error);
      setPosting(false);
    }
  
  };

  const fetchPost = async () => {
    await fetchPosts(user?.token, dispatch);
    setLoading(false)
  }
  const handleLikePost = async (uri) => {
    await likePost({ uri, token: user?.token });

    fetchPost();
  }
  const handleDelete = async (id) => {
    await deletePost(id, user.token);
    await fetchPost();
  }
  const fetchFriendRequests = async () => {
    try {
      const res = await apiRequest({
        url: "/users/get-friend-request",
        token: user?.token,
        method: "POST"
      })
     setFriendRequest(res?.data);
    } catch (error) {
      
    }
  }
  const fetchSuggestedFriend = async () => {
    try {
      const res = await apiRequest({
        url: "/users/suggested-friends",
        token: user?.token,
        method: "POST",
      });
      setSuggestedFriends(res?.data);
    } catch (error) {
      console.log(error);
    }
  }
  const handleFriendRequest = async (id) => {
    try {
      const res = await sendFriendRequest(user.token, id);
      await fetchSuggestedFriend();
    } catch(error) {

    }
  }
  const acceptedFriendRequest = async (id, status) => {
    try {
      const res = await apiRequest({
        url: "/users/accept-request",
        token: user?.token,
        method: "POST",
        data: { rid: id, status }
      });
      setFriendRequest(res?.data);
    } catch(error) {
      
    }
  }
  const getUser = async () => {
    // const res =await getUserInfo(user?.token);
    // const newData = { token: user?.token, ...res };
    // dispatch(UserLogin(newData));
  }

  useEffect(() => {
    setLoading(true);
    getUser();
    fetchPost();
    fetchFriendRequests();
    fetchSuggestedFriend();
  },[]);
  

  return (
    <>
      <div className='w-full px-0 lg:px-10 pb-20 2xl:px-40 bg-[#07071b] lg:rounded-lg h-screen overflow-hidden'>
        <TopBar />

        <div className='w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full'>

          <div className='hidden w-1/3 lg:w-1/4 h-full md:flex flex-col gap-6 overflow-y-auto'>
            <ProfileCard user={user} />
            <FriendsCard friends={user?.friends} />
          </div>

          <div className='flex-1 h-full px-4 flex flex-col gap-6 overflow-y-auto rounded-lg'>
          <form
              onSubmit={handleSubmit(handlePostSubmit)}
              className='bg-[#121230] px-4 rounded-lg'
            >
              <div className='w-full flex items-center gap-2 py-4'>
                <img
                  src={user?.profileUrl ?? NoProfile}
                  alt='User Image'
                  className='w-14 h-14 rounded-full object-cover'
                />
                <TextInput
                  styles='w-full rounded-lg py-5'
                  placeholder="Qual sua dúvida?"
                  name='description'
                  register={register("description", {
                    required: "Write something about post",
                  })}
                  error={errors.description ? errors.description.message : ""}
                />
                {posting ? (
                    <Loading />
                  ) : (
                    <CustomButton
                      type='submit'
                      title='Post'
                      containerStyles='bg-[#3ed0e7] text-white py-1 h-[50px] px-6 rounded-lg font-semibold text-sm'
                    />
                  )}
              </div>
              {errMsg?.message && (
                <span
                  role='alert'
                  className={`text-sm ${
                    errMsg?.status === "failed"
                      ? "text-[#f64949fe]"
                      : "text-[#2ba150fe]"
                  } mt-0.5`}
                >
                  {errMsg?.message}
                </span>
              )}                                                    
            </form>
            
            {loading ? (
              <Loading />
            ) : posts?.length > 0 ? (
              posts?.map((post) => (
                <PostCard
                  key={post?._id}
                  post={post}
                  user={user}
                  deletePost={handleDelete}
                  likePost={handleLikePost}
                />
              ))
            ) : (
              <div className='flex w-full h-full items-center justify-center'>
                <p className='text-lg text-ascent-2'>No Post Available</p>
              </div>
            )}

          </div>

          <div className='hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto'>
              <div className='flex items-center justify-between text-xl text-ascent-1 pb-2 border-b border-[#66666645]'>
                <span> Solicitações de amizade</span>
                <span>{friendRequest?.length}</span>
              </div>

              <div className='w-full flex flex-col gap-4 pt-4'>
                {friendRequest?.map(({ _id, requestFrom: from }) => (
                    <div key={_id} className='flex items-center justify-between'>
                      <Link
                        to={"/profile/" + from._id}
                        className='w-full flex gap-4 items-center cursor-pointer'
                      >
                        <img
                          src={from?.profileUrl ?? NoProfile}
                          alt={from?.firstName}
                          className='w-10 h-10 object-cover rounded-full'
                        />
                        <div className='flex-1'>
                          <p className='text-base font-medium text-ascent-1'>
                            {from?.firstName} {from?.lastName}
                          </p>
                          <span className='text-sm text-ascent-2'>
                            {from?.profession ?? "Sem profissão"}
                          </span>
                        </div>
                      </Link>

                      <div className='flex gap-1'>
                        <CustomButton
                          title='Aceitar'
                          onClick={() => acceptedFriendRequest(_id, "Accepted")}
                          containerStyles='bg-[#0444a4] text-xs text-white px-1.5 py-1 rounded-full'
                        />
                        <CustomButton
                          title='Recusar'
                          onClick={() => acceptedFriendRequest(_id, "Denied")}
                          containerStyles='border border-[#666] text-xs text-ascent-1 px-1.5 py-1 rounded-full'
                        />
                      </div>
                    </div>
                  ))}
              </div>
              <div className='w-full bg-[#121230] shadow-sm rounded-lg px-5 py-5'>
                  <div className='flex items-center justify-between text-lg text-ascent-1 border-b border-[#66666645]'>
                    <span>Sugestões de amizade</span>
                  </div>
                  <div className='w-full flex flex-col gap-4 pt-4'>
                  {suggestedFriends?.map((friend) => (
                  <div
                    className='flex items-center justify-between'
                    key={friend._id}
                  >
                    <Link
                      to={"/profile/" + friend?._id}
                      key={friend?._id}
                      className='w-full flex gap-4 items-center cursor-pointer'
                    >
                      <img
                        src={friend?.profileUrl ?? NoProfile}
                        alt={friend?.firstName}
                        className='w-10 h-10 object-cover rounded-full'
                      />
                      <div className='flex-1 '>
                        <p className='text-base font-medium text-ascent-1'>
                          {friend?.firstName} {friend?.lastName}
                        </p>
                        <span className='text-sm text-ascent-2'>
                          {friend?.profession ?? "Sem profissão"}
                        </span>
                      </div>
                    </Link>

                    <div className='flex gap-1'>
                      <button
                        className='bg-[#0444a430] text-sm text-white p-1 rounded'
                        onClick={() => {handleFriendRequest(friend?._id)}}
                      >
                        <BsPersonFillAdd size={20} className='text-[#0f52b6]' />
                      </button>
                    </div>
                  </div>
                ))}
                  </div>
              </div>     
          </div>

        </div>



      </div>
      {edit && <EditProfile />}
    </>
  );
};

export default Home;
