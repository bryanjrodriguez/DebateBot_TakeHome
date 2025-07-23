import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  //ran out of time to implement pagination :(
  const { conversationId, limit = 40 } = req.query

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/history/${conversationId}?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Error fetching chat history:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 