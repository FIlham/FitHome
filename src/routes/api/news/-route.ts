import Elysia, { t } from "elysia";
import { db } from "../../../db";
import { news } from "../../../db/schema";

export const newsRoute = new Elysia({ prefix: "/news" })
    .get("/", { message: "News route" })
    .get("/all", async ({ query, set }) => {
        try {
            const getNews = await db.select().from(news).limit(query.limit)

            return {
                success: true as const,
                data: getNews
            }

        } catch (error) {
            set.status = 500
            return {
                success: false as const,
                message: "Server internal error"
            }
        }
    }, {
        query: t.Object({
            limit: t.Number()
        })
    })
    .get("/:newsId", async ({ params, set }) => {
        try {
            const news = await db.query.news.findFirst({
                where: {
                    id: params.newsId
                }
            })

            if (!news) {
                set.status = 404
                return { success: false as const, message: "News not found" }
            }

            return {
                success: true as const,
                data: news
            }
        } catch (error) {
            set.status = 500
            return {
                success: false,
                message: "Internal server error"
            }
        }
    }, {
        params: t.Object({
            newsId: t.String()
        })
    })