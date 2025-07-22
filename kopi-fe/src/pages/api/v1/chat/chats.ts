import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  if (!apiUrl) {
    console.error('API URL not configured')
    return res.status(500).json({ message: 'API URL not configured' })
  }

  try {
    console.log(`Fetching from: ${apiUrl}/chat/chats`)
    const response = await fetch(`${apiUrl}/chat/chats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      console.error(`API responded with status: ${response.status}`)
      const text = await response.text()
      console.error('Response body:', text)
      return res.status(response.status).json({ message: 'API request failed' })
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
} 