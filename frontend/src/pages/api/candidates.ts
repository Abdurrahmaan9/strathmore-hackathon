import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const mockCandidates = [
      {
        id: 1,
        name: "John Doe",
        position: "President",
        county: "Nairobi",
        party_name: "Democratic Party",
        party_code: "DP"
      },
      {
        id: 2,
        name: "Jane Smith", 
        position: "Governor",
        county: "Mombasa",
        party_name: "Republican Party",
        party_code: "RP"
      }
    ];

    res.status(200).json({
      success: true,
      data: mockCandidates
    });
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
