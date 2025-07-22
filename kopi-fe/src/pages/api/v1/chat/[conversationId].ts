import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { conversationId } = req.query

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/chat/${conversationId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Error deleting chat:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 