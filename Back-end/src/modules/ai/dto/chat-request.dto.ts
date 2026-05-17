import { ApiProperty } from '@nestjs/swagger';

export class ChatRequestDto {
  @ApiProperty({
    description: 'ID del usuario',
    example: 'u1',
  })
  userId: string;

  @ApiProperty({
    description: 'Historial de mensajes previos en la conversación',
    type: [Object],
    example: [
      { role: 'user', content: 'Quiero una rutina para piel grasa' },
      { role: 'assistant', content: 'Te ayudo a crear una rutina...' },
    ],
  })
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];

  @ApiProperty({
    description: 'Contexto actual de la rutina que se está construyendo',
    required: false,
    example: {
      skinType: 'grasa',
      type: 'pm',
      currentSteps: [],
    },
  })
  routineContext?: {
    skinType?: string;
    type?: string;
    currentSteps?: any[];
  };
}
