import { Controller, Get, Query } from '@nestjs/common';
import { ModelsService } from './models.service';
import { QueryModelsDto } from './dto/query-models.dto';
import { ModelDocument } from './model.schema';

@Controller('models')
export class ModelsController {
  constructor(private readonly modelsService: ModelsService) {}

  @Get()
  async findAll(
    @Query() query: QueryModelsDto,
  ): Promise<{ data: ModelDocument[]; total: number }> {
    const models = await this.modelsService.findAll(query);
    return { data: models, total: models.length };
  }
}
