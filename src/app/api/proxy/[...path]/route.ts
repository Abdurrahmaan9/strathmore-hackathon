// Next.js API proxy to handle CORS issues
// This will forward requests to the backend API

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost';
// const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://675cfa0152ad9dd6-102-212-236-169.serveousercontent.com';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    
    console.log(`Proxy GET request for path: ${path}`);
    
    // Handle parties endpoints with mock data since Vote Trace Kenya doesn't have parties
    if (path.startsWith('parties')) {
      const mockData = {
        success: true,
        data: {
          parties: [
            {
              id: 1,
              name: "Party A",
              abbreviation: "PA",
              color: "#FF0000",
              logo: null,
              description: "Mock Party A",
              candidates_count: 3,
              total_spend: 1000000,
              integrity_score: 75
            },
            {
              id: 2,
              name: "Party B", 
              abbreviation: "PB",
              color: "#0000FF",
              logo: null,
              description: "Mock Party B",
              candidates_count: 2,
              total_spend: 800000,
              integrity_score: 85
            }
          ],
          total: 2,
          page: 1,
          per_page: 10
        }
      };
      
      return NextResponse.json(mockData, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    
    // Handle donors endpoints with mock data since backend doesn't have donor details
    if (path.includes('donors/')) {
      const pathParts = path.split('/');
      const candidateId = pathParts[pathParts.length - 1]; // Get the last part (candidate ID)
      console.log(`Handling donor request for candidate: ${candidateId}`);
      
      const mockDonorData = {
        candidate_id: parseInt(candidateId),
        total_reported_income: 10000000,
        donor_count: 6,
        risk_summary: {
          high: 2,
          medium: 0,
          low: 4,
          high_risk_percentage: 33.3
        },
        red_flags: {
          briefcase_companies: 0,
          unverifiable_entities: 2,
          concentration_risk: {
            top_donor_percentage: 40,
            top_3_donors_percentage: 83
          }
        },
        donors: [
          {
            id: 14,
            created_at: "2026-03-06T17:45:37.479+00:00",
            candidate_id: parseInt(candidateId),
            donor_name: "Savanna Ventures Ltd",
            donation_amount: 4000000,
            registration_date: "2024-02-10",
            company_age_days: 755,
            risk_score: "LOW",
            donation_percentage: 3.01,
            risk_factors: []
          },
          {
            id: 15,
            created_at: "2026-03-06T17:45:37.479+00:00",
            candidate_id: parseInt(candidateId),
            donor_name: "Rift Valley Holdings",
            donation_amount: 2500000,
            registration_date: "2023-06-01",
            company_age_days: 1009,
            risk_score: "LOW",
            donation_percentage: 1.88,
            risk_factors: []
          },
          {
            id: 16,
            created_at: "2026-03-06T17:45:37.479+00:00",
            candidate_id: parseInt(candidateId),
            donor_name: "Coastal Traders Sacco",
            donation_amount: 1800000,
            registration_date: "2024-01-15",
            company_age_days: 781,
            risk_score: "LOW",
            donation_percentage: 1.35,
            risk_factors: []
          },
          {
            id: 18,
            created_at: "2026-03-06T17:45:37.479+00:00",
            candidate_id: parseInt(candidateId),
            donor_name: "Nairobi Realty Group",
            donation_amount: 900000,
            registration_date: "2022-11-01",
            company_age_days: 1221,
            risk_score: "LOW",
            donation_percentage: 0.68,
            risk_factors: []
          },
          {
            id: 17,
            created_at: "2026-03-06T17:45:37.479+00:00",
            candidate_id: parseInt(candidateId),
            donor_name: "Mr. Ali Hassan",
            donation_amount: 600000,
            registration_date: null,
            company_age_days: null,
            risk_score: "HIGH",
            donation_percentage: 0.45,
            risk_factors: []
          },
          {
            id: 19,
            created_at: "2026-03-06T17:45:37.479+00:00",
            candidate_id: parseInt(candidateId),
            donor_name: "Ms. Wanjiru Njoroge",
            donation_amount: 200000,
            registration_date: null,
            company_age_days: null,
            risk_score: "HIGH",
            donation_percentage: 0.15,
            risk_factors: []
          }
        ]
      };
      
      return NextResponse.json(mockDonorData, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }
    
    // Add /api/v1 prefix for backend API
    const backendPath = path.startsWith('health/') ? path : `api/v1/${path}`;
    const url = `${BACKEND_API_URL}/${backendPath}`;
    const searchParams = request.nextUrl.searchParams;
    const fullUrl = searchParams ? `${url}?${searchParams}` : url;

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy GET error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    // Add /api/v1 prefix for backend API
    const backendPath = path.startsWith('health/') ? path : `api/v1/${path}`;
    const url = `${BACKEND_API_URL}/${backendPath}`;
    
    const body = await request.text();
    const contentType = request.headers.get('content-type') || 'application/json';

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Accept': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy POST error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    // Add /api/v1 prefix for backend API
    const backendPath = path.startsWith('health/') ? path : `api/v1/${path}`;
    const url = `${BACKEND_API_URL}/${backendPath}`;
    
    const body = await request.text();
    const contentType = request.headers.get('content-type') || 'application/json';

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
        'Accept': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    // Add /api/v1 prefix for backend API
    const backendPath = path.startsWith('health/') ? path : `api/v1/${path}`;
    const url = `${BACKEND_API_URL}/${backendPath}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Proxy DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy request to backend' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
