import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { errorMessage } from 'src/common/common.function';
import { CoreOutput } from 'src/common/dtos/output.dto';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dtos/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dtos/edit-profile.dto';
import { LoginInput, LoginOutput } from './dtos/login.dto';
import { UserProfileOutput } from './dtos/user-profile.dto';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly jwtService: JwtService,
  ) {}

  async createAccount({
    email,
    password,
    role,
    nickName,
    phoneNum,
    snsUrls,
    verified,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    try {
      const { ok, error } = await this.checkExist(email);
      if (ok != true) {
        return errorMessage(error);
      }
      const user = await this.users.save(
        this.users.create({
          email,
          password,
          role,
          nickName,
          phoneNum,
          snsUrls,
          verified,
        }),
      );
      return {
        ok: true,
      };
    } catch (error) {
      return errorMessage('회원가입이 실패했습니다.', error);
    }
  }

  async login({ email, password }: LoginInput): Promise<LoginOutput> {
    try {
      const user = await this.users.findOne(
        { email },
        { select: ['email', 'password', 'id'] },
      );
      if (!user) {
        return errorMessage('존재하지않는 유저입니다.');
      }

      const pwCorrect = await user.checkPassword(password);
      if (!pwCorrect) {
        return errorMessage('잘못된 패스워드입니다.');
      }

      const token = this.jwtService.sign({ id: user.id });
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return errorMessage('로그인이 실패했습니다.', error);
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.users.findOneOrFail({ id });

      return {
        ok: true,
        user,
      };
    } catch (error) {
      return errorMessage('찾는 유저가 존재하지않습니다.');
    }
  }

  async editProfile(
    userId: number,
    {
      password,
      role,
      phoneNum,
      snsUrls,
      nickName,
      profilePicture,
    }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const user = await this.users.findOne(userId);
      if (password) {
        user.password = password;
      }
      if (role) {
        user.role = role;
      }
      if (phoneNum) {
        user.phoneNum = phoneNum;
      }
      if (snsUrls) {
        user.snsUrls = snsUrls;
      }
      if (nickName) {
        user.nickName = nickName;
      }
      if (profilePicture) {
        user.profilePicture = profilePicture;
      }
      await this.users.save(user);
      return {
        ok: true,
      };
    } catch (error) {
      return errorMessage('프로필 변경 실패했습니다.', error);
    }
  }

  async checkExist(email: string): Promise<CoreOutput> {
    try {
      const checkExist = await this.users.findOne({ email });
      if (checkExist) {
        return errorMessage('이미 사용된 이메일입니다.');
      }
      return {
        ok: true,
      };
    } catch (error) {
      return errorMessage(error);
    }
  }
}
