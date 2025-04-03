import { Router, Request, Response } from 'express';
import { db } from '../config/database';
import { calculateDistances } from '../utils';

interface QueryResult {
    id: number;
    source_address: string;
    destination_address: string;
    distance_miles: number;
    distance_kilometers: number;
    created_at: Date;
}

interface DistanceResponse {
    miles: number;
    kilometers: number;
}

const router = Router();

router.get('/health', async (req: Request, res: Response) => {
    try {
        await db.one('SELECT 1');
        res.json({ status: 'ok', database: 'connected' });
    } catch (error) {
        res.status(500).json({ 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Database connection failed' 
        });
    }
});

router.get('/history', async (req: Request, res: Response) => {
    try {
        const queries = await db.any<QueryResult>(
            `SELECT 
                id,
                source_address,
                destination_address,
                distance_miles,
                distance_kilometers,
                created_at
            FROM distance_queries
            ORDER BY created_at DESC`
        );

        res.json({
            status: 'success',
            data: queries.map((query: QueryResult) => ({
                queryId: query.id,
                sourceAddress: query.source_address,
                destinationAddress: query.destination_address,
                distances: {
                    miles: Number(query.distance_miles).toFixed(2),
                    kilometers: Number(query.distance_kilometers).toFixed(2)
                },
                timestamp: query.created_at
            }))
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve history'
        });
    }
});

router.post('/calculate-distance', async (req: Request, res: Response) => {
    try {
        const { sourceAddress, destinationAddress } = req.body as { 
            sourceAddress?: string; 
            destinationAddress?: string 
        };
        
        if (!sourceAddress || !destinationAddress) {
            return res.status(400).json({
                status: 'error',
                message: 'Source and destination addresses are required'
            });
        }

        const decodedSourceAddress = decodeURIComponent(sourceAddress);
        const decodedDestinationAddress = decodeURIComponent(destinationAddress);

        const distances = await calculateDistances(decodedSourceAddress, decodedDestinationAddress);

        const result = await db.one<{ id: number }>(
            `INSERT INTO distance_queries(
                source_address, 
                destination_address, 
                distance_miles, 
                distance_kilometers
            ) VALUES($1, $2, $3, $4) RETURNING id`,
            [
                decodedSourceAddress,
                decodedDestinationAddress,
                distances.miles,
                distances.kilometers
            ]
        );

        res.json({
            status: 'success',
            data: {
                queryId: result.id,
                sourceAddress: decodedSourceAddress,
                destinationAddress: decodedDestinationAddress,
                distances: {
                    miles: Number(distances.miles).toFixed(2),
                    kilometers: Number(distances.kilometers).toFixed(2)
                }
            }
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            status: 'error',
            message: error instanceof Error ? error.message : 'Failed to process request'
        });
    }
});

export default router; 