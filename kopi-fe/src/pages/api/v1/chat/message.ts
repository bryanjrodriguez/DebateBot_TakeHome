import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()
    return res.status(response.status).json(data)
  } catch (error) {
    console.error('Error posting message:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 