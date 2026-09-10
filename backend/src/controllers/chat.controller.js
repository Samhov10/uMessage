import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
        try {
            const token = generateStreamToken(req.res.id);

            res.status(200).json({ token });
        } catch (error) {
            console.log("Ошибка в getStreamToken Controller:", error.message);
            res.status(500).json({message: "Время ожидания истекло!"})
        }
}