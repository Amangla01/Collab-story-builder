import API from "./api";

export const createStory = async (storyData)=> {
    const {data} = await API.post("/stories", storyData);
    return data;
}
export const getStories = async ()=> {
    const {data} = await API.get("/stories");
    return data;
}
export const getMyStories = async () => {
    const {data} = await API.get("/stories/mine");
    return data;
}
export const getStoryByRoomCode = async (roomCode) => {
    const {data} = await API.get(`/stories/${roomCode}`);
    return data;
}
export const joinStory = async (roomCode)=> {
    const {data} = await API.post(`/stories/${roomCode}/join`);
    return data;
}
export const submitEntry = async (roomCode, content, anonymousName)=> {
    const {data} = await API.post(`/stories/${roomCode}/entries`, {
        content,
        anonymousName,
    })
    return data;
}
export const reactToEntry = async (entryId, reactionKey)=> {
    const {data} = await API.put(`/stories/entries/${entryId}/react`, {
        reactionKey,
    });
    return data;
}
export const completeStory = async (roomCode)=> {
    const {data} = await API.put(`/stories/${roomCode}/complete`);
    return data;
}
