import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const mockCounties = [
      {
        id: 1,
        name: "Nairobi"
      },
      {
        id: 2,
        name: "Mombasa"
      },
      {
        id: 3,
        name: "Kisumu"
      }
    ];

    res.status(200).json({
      success: true,
      data: mockCounties
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
