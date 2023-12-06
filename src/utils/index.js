import axios from "axios";
import { SetPosts } from "../redux/postSlice"

const API_URL = "http://localhost:5000";

export const API = axios.create({
    baseURL: API_URL,
    responseType: "json",
});


export const apiRequest = async ({ url, token, data, method }) => {
    try {
        const result = await API(url, {
            method: method || "GET",
            data: data,
            headers: {
                "content-type": "application/json",
                Authorization: token ? `Bearer ${token}`: "",
            }
        });

        return result?.data
    } catch (error) {
        const err = error.response.data;
        return { status: error.success, message: error.message };
        
    }
}

export const handleFileUpload = async (uploadFile) => {
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("upload_preset", "socialmedia");

    try {
       const response = await axios.post(
        `https://api.cloudinary.com/v1_1/de1pki9tf/image/upload`,
        formData
       ) 
       return response.data.secure_url;
    } catch (error) {
        console.log(error);
    }
}

export const fetchPosts = async (token, dispatch, uri, data) => {
    try {
        const res = await apiRequest({
            url: uri || "/posts",
            token,
            method: "POST",
            data: data || {}
        });

        dispatch(SetPosts(res?.data));
    } catch (error) {
        
    }
}

export const getUserInfo = async (token, id) => {
    try {
        const uri = id === undefined ? "/users/get-user": "/users/get-user/" + id;

        const res = await apiRequest({
            url: uri,
            token,
            method: "POST"
        });

        if(res?.message === "Authentication failed") {
            localStorage.removeItem("user");
            window.alert("User session expired. Login again");
            window.location.replace("/login");
        }

    } catch (error) {
        
    }
}

export const likePost = async ({ uri, token }) => {
    try {
        
        const res = await apiRequest({
            url: uri,
            token,
            method: "POST"
        });

        return res;

    } catch (error) {
        console.log(error)
    }
}

export const deletePost = async ({ id, token }) => {
    try {
        console.log(id);
        const res = await apiRequest({
            url: "/posts/" + id,
            token,
            method: "DELETE"
        });

        return res;

    } catch (error) {
        console.log(error)
    }
}

export const sendFriendRequest = async (token, id) => {
    try {
        const res = await apiRequest({
            url: "/users/friend-request",
            token,
            method: "POST",
            data: { requestTo: id }
        });
        return;
    } catch (error) {
        console.log(error);
    }
}

export const handleAiResponse = async (postId, question, token) => {
    try {
      const response = await apiRequest({
        url: `/posts/ai-response/${postId}`, // Substitua "/your-endpoint-path/" pelo caminho real
        data: { question },  // Inclua os dados que você deseja enviar (no caso, a pergunta)
        token,
        method: "POST",
      });
  
      console.log("AI Response:", response); // Faça o que quiser com a resposta da AI
  
    } catch (error) {
      console.error("Error fetching AI response:", error);
    }
  };

