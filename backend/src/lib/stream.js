import {StreamChat} from "stream-chat"
import "dotenv/config.js"

const apiKey = process.env.STEAM_API_KEY
const apiSecret = process.env.STEAM_API_SECRET

if(!apiKey || !apiSecret) {
    console.error("Отсутствует API-ключ или секрет uMessage")
}

const StreamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
    try{
            await StreamClient.upsertUsers([userData]);
            return userData
    } catch(error){
        console.error("Произошла ошибка при создании аккаунта uMessage:", error)
    }
}


export const generateStreamToken = (userId) => {
    try {
        const userIdStr = userId.toString();
        return streamClient.createToken(userIdStr);
    } catch (error) {
        console.error("Ошибка генерации Steam Token:", error)
    }
};