import { ApiProperty } from '@nestjs/swagger';

export class CreateRutinaDto {
    @ApiProperty({
        description: 'ID del usuario que crea la rutina',
        example: 'u1'
    })
    userId: string;

    @ApiProperty({
        description: 'Nombre de la rutina',
        example: 'Rutina de mañana'
    })
    name: string;

    @ApiProperty({
        description: 'Descripción detallada de la rutina',
        example: 'Rutina ligera para piel mixta.'
    })
    description: string;

    @ApiProperty({
        description: 'Fecha de publicación (opcional, se genera automáticamente si no se proporciona)',
        required: false,
        example: '2026-03-14T09:20:00.000Z'
    })
    publishedAt?: string;

    @ApiProperty({
        description: 'Tipo de rutina: am (mañana) o pm (noche)',
        example: 'am',
        enum: ['am', 'pm']
    })
    type: string;

    @ApiProperty({
        description: 'Tipo de piel para la cual está diseñada la rutina',
        example: 'mixta',
        enum: ['normal', 'seca', 'grasa', 'mixta', 'sensible', 'opaca', 'texturizada', 'acneica']
    })
    skinType: string;

    @ApiProperty({
        description: 'Lista de pasos de la rutina',
        example: [
            { id: 'r1s1', name: 'Limpieza suave', order: 0, productId: '12', notes: 'Usar con agua tibia' },
            { id: 'r1s2', name: 'Hidratación', order: 1, productId: '5', notes: 'Aplicar sobre piel limpia' }
        ]
    })
    steps: {
        id: string;
        name: string;
        order: number;
        productId: string;
        product?: object;
        notes?: string;
    }[];

    @ApiProperty({
        description: 'Lista de comentarios (opcional)',
        required: false,
        type: [Object]
    })
    comments?: object[];

    @ApiProperty({
        description: 'Lista de IDs de usuarios que dieron voto positivo (opcional)',
        required: false,
        type: [String],
        example: ['u2', 'u3']
    })
    upvotes?: string[];

    @ApiProperty({
        description: 'Lista de IDs de usuarios que dieron voto negativo (opcional)',
        required: false,
        type: [String],
        example: ['u6']
    })
    downvotes?: string[];
}
