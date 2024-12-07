import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';
import { PaginationDTO } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProductService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger('ProductService');

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Database connected');
  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({
      data: {
        ...createProductDto,
      },
    });
  }

  async findAll(paginationDTO: PaginationDTO) {
    const total = await this.product.count({ where: { available: true } });
    const totalPages = Math.ceil(total / paginationDTO.limit);

    return {
      data: await this.product.findMany({
        take: paginationDTO.limit,
        skip: (paginationDTO.page - 1) * paginationDTO.limit,
        where: { available: true },
      }),
      metadata: {
        page: paginationDTO.page,
        totalPages,
        total,
      },
    };
  }

  async findOne(id: number) {
    const product = await this.product.findUnique({
      where: { id, available: true },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: __, ...data } = updateProductDto;
    return await this.product.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    await this.findOne(id);

    return await this.product.update({
      where: { id },
      data: {
        available: false,
      },
    });
  }
}
