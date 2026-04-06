import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';
import { ModelSchema } from './model.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Model', schema: ModelSchema }]),
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
