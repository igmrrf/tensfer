import { Body, Controller, Get, Post, Put } from '@nestjs/common';
import { User as UserModel } from '@prisma/client';
import { AppService } from './app.service';
import { CreateDto, ValidateDto } from './dto/app.dto';

// The @Controller() decorator marks the class as a Nest controller
@Controller('/')
export class AppController {
  // The constructor initializes the AppService instance
  constructor(private readonly appService: AppService) {}

  // The @Get() decorator creates a handler for the / route
  @Get()
  async get() {
    return 'Hello World!';
  }

  // The @Post() decorator creates a handler for the /create route
  @Post()
  async create(@Body() createDto: CreateDto): Promise<UserModel> {
    // The handler calls the AppService's processAccount() method
    return this.appService.processAccount(createDto);
  }

  // The @Put() decorator creates a handler for the /validate route
  @Put()
  // The @Body() decorator binds the request body to the validateDto parameter
  async validate(@Body() validateDto: ValidateDto): Promise<UserModel> {
    // The handler calls the AppService's confirmAccount() method
    return this.appService.confirmAccount(validateDto);
  }
}
