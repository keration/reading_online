export interface Comment {
  id: string
  user: {
    id: string
    name: string
    avatar: string
  }
  content: string
  rating: number
  createTime: string
  liked: boolean
  likeCount: number
}