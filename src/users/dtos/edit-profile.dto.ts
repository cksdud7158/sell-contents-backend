import { InputType, ObjectType, OmitType, PartialType } from '@nestjs/graphql';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { User } from '../entities/user.entity';

@ObjectType()
export class EditProfileOutput extends CoreOutput {}

@InputType()
export class EditProfileInput extends PartialType(
  OmitType(User, ['id', 'createdAt', 'updateAt', 'verified', 'email']),
) {}
