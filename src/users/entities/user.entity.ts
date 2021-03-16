import {
  Field,
  InputType,
  Int,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { CoreEntity } from 'src/common/entities/core.entity';
import { InternalServerErrorException } from '@nestjs/common';
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IsBoolean, IsEmail, IsEnum, IsString } from 'class-validator';

export enum UserRole {
  Admin = 'Admin',
  Photo = 'Photo',
  Model = 'Model',
  NormalUser = 'NormalUser',
}

registerEnumType(UserRole, { name: 'UserRole' });

@InputType('SnsUrlsInputType', { isAbstract: true })
@ObjectType()
export class snsUrls {
  @Field((type) => String)
  snsName: string;

  @Field((type) => String)
  url: string;
}

@InputType('UserInputType', { isAbstract: true })
@ObjectType()
@Entity()
export class User extends CoreEntity {
  @Column({ unique: true })
  @Field((type) => String)
  @IsEmail()
  email: string;

  @Column({ select: false })
  @Field((type) => String)
  @IsString()
  password: string;

  @Column({ type: 'simple-array', enum: UserRole })
  @Field((type) => [UserRole])
  roles: UserRole[];

  @Column({ nullable: true })
  @Field((type) => String, { nullable: true })
  phoneNum?: string;

  @Column({ default: false })
  @Field((type) => Boolean)
  @IsBoolean()
  verified: boolean;

  @Column({ type: 'json', nullable: true })
  @Field((type) => snsUrls, { nullable: true })
  snsUrls?: snsUrls;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      try {
        this.password = await bcrypt.hash(this.password, 10);
      } catch (e) {
        console.log(e);
        throw new InternalServerErrorException();
      }
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async deleteSpecialCharacters(): Promise<void> {
    if (this.phoneNum) {
      try {
        var specialCharactersFilter = /[\{\}\[\]\/?.,;:|\)*~`!^\-_+<>@\#$%&\\\=\(\'\"]/gi;
        this.phoneNum = this.phoneNum.replace(specialCharactersFilter, '');
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException();
      }
    }
  }

  async checkPassword(aPassword: string): Promise<boolean> {
    try {
      const ok = await bcrypt.compare(aPassword, this.password);
      return ok;
    } catch (e) {
      console.log(e);
      throw new InternalServerErrorException();
    }
  }
}
