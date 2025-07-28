import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';
import { TestResult, TestResultSchema } from 'src/schemas/test-result.schema';


@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, {name: TestResult.name, schema: TestResultSchema}])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
