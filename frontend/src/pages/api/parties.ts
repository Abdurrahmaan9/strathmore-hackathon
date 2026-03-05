import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const mockParties = [
      {
        id: 1,
        name: "Democratic Party",
        code: "DP",
        status: "active"
      },
      {
        id: 2,
        name: "Republican Party", 
        code: "RP",
        status: "active"
      }
    ];

    res.status(200).json({
      success: true,
      data: mockParties
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
