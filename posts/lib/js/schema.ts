interface App {
    users?: {
        [$uid: string]: {
            name: string
            image: {
                color: string // hexColor
                url?: string // url
            }
            meta: {
                created: number
            }
            friends?: {
                [$uid: string]: true // the key is the friend's user id
            }
            workouts?: {
                [$workoutId: string]: {
                    name: string
                    duration: number
                    calories: number
                    timestamp: number // new Date().getTime()
                }
            }
        }
    }
    "public-users"?: {
        [$uid: string]: {
            name: string
            color: string // hexColor
            url?: string // url
        }
    }
    posts?: {
        [$postId: string]: {
            author: string // $uid
            public: boolean // true = anyone, including you, can see | false = only you and friends see
            meta: {
                created: number // new Date().getTime()
                updated: number // same as created but can change
            }
            message: string
            gif?: string // url of gif
            comments?: {
                [$commentId: string]: number // the key is the comment's id; the value is when the comment was made
            }
            likes?: {
                [$uid: string]: true // the key is the liker's user id
            }
        }
    }
    comments?: {
        [$commentId: string]: {
            author: string // $uid
            target: string // $postId
            meta: {
                created: number // new Date().getTime()
                updated: number // same as created but can change
            }
            message: string
        }
    }
}