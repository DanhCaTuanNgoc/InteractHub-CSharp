export type FriendshipRelationshipStatus = 'Self' | 'NotFriends' | 'Friends' | 'RequestSent' | 'RequestReceived'

export type FriendshipRelationship = {
  status: FriendshipRelationshipStatus
  friendshipId?: string | null
  senderId?: string | null
  receiverId?: string | null
}