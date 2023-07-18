import { Solver } from '2captcha';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { CreateDto, ValidateDto, createAccountDto, updateAccountDto } from './dto/app.dto';
import { PrismaService } from './prisma/prisma.service';

// The @Injectable() decorator marks the class as a Nest service
@Injectable()
// The class implements the AppService interface
export class AppService {
  // The logger instance is used to log information to the console
  private readonly logger = new Logger(AppService.name);
  // The constructor initializes the PrismaService, HttpService, and ConfigService instances
  constructor(
    private prisma: PrismaService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  // The generateCaptchaToken() method uses the 2captcha API to generate a captcha token
  async generateCaptchaToken() {
    // The bushaSiteKey, bushaCaptchaPageUrl and captchaKey configuration values are retrieved from the .env file
    const bushaSiteKey = this.configService.get<string>('busha.siteKey');
    const bushaCaptchaUrl = this.configService.get<string>('busha.captchaPageUrl');
    const captchaKey = this.configService.get<string>('app.captchaKey');
    // The Solver class is instantiated with the captchaKey
    const solver = new Solver(captchaKey);

    // The recaptcha() method is called with the bushaSiteKey and bushaCaptchaUrl
    const { data } = await solver.recaptcha(bushaSiteKey, bushaCaptchaUrl);
    // The captcha token is returned
    return data;
  }

  // The getHeaders() method returns the headers to be used for the HTTP requests
  getHeaders(type: string) {
    // The userAgent, origin, and referer configuration values are retrieved from the .env file
    const userAgent = this.configService.get<string>('app.defaultUserAgent');
    let origin: string, referer: string;

    // The type parameter is used to determine the origin and referer values
    if (type === 'auth') {
      origin = this.configService.get<string>('busha.authOrigin');
      referer = this.configService.get<string>('busha.authReferer');
    } else {
      origin = this.configService.get<string>('busha.origin');
      referer = this.configService.get<string>('busha.referer');
    }

    // The headers object is created
    const headers = {
      Referer: referer,
      origin,
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'User-Agent': userAgent,
    };

    // The headers are returned
    return headers;
  }

  // The createAccount() method creates a new user account
  async createAccount(payload: createAccountDto) {
    // The email and confirmation_code values are retrieved from the payload
    const { confirmation_code, email } = payload;

    // The user is created using the Prisma client
    const user = await this.prisma.user.create({
      data: {
        email,
        confirmation_code,
      },
    });
    // The user is returned
    return user;
  }

  // The updateUser() method updates the user account with the access token
  async updateUser(payload: updateAccountDto) {
    // The access_token and id values are retrieved from the payload
    const { access_token, id } = payload;
    // The bushaAuthBaseUrl configuration value is retrieved from the .env file
    const bushaAuthBaseUrl = this.configService.get<string>('busha.authBaseUrl');

    // The user account is retrieved from the Busha API
    const { data: accountResponse } = await firstValueFrom(
      // The HTTP request is made to the /accounts route
      this.httpService
        .get(`${bushaAuthBaseUrl}/accounts`, {
          headers: {
            Authorization: `Bearer ${access_token}`,
            ...this.getHeaders('auth'),
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            // The error is logged to the console
            this.logger.error(error.response.data);
            // The error response is checked for a message
            if (error.response.data) {
              const { message } = error.response.data['error'];
              if (message) {
                // If a message is found, an UnauthorizedException is thrown
                throw new UnauthorizedException(message);
              }
            }
            // If no message is found, an UnauthorizedException is thrown
            throw new UnauthorizedException('Invalid Authentication');
          }),
        ),
    );
    // The accountResponse is checked for a status
    const { data, status } = accountResponse;
    // If the status is not success, an UnauthorizedException is thrown
    if (status !== 'success') {
      throw new UnauthorizedException('Invalid Authentication');
    }

    // The user is updated using the Prisma client
    const updatedUser = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        // The data and confirmation_code values are updated
        data,
        confirmation_code: 'auth_already_done',
      },
    });
    // The updated user is returned
    return updatedUser;
  }

  // The processAccount() method processes the user account
  async processAccount(payload: CreateDto) {
    // email and password are extracted from the payload
    const { email, password } = payload;
    // The user check for existing from the Prisma client
    let existingUser = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    // The bushaBaseUrl configuration value is retrieved from the .env file
    const bushaBaseUrl = this.configService.get<string>('busha.baseUrl');

    // The email is verified using the Busha API
    const { data: emailResponse } = await firstValueFrom(
      this.httpService
        .get(`${bushaBaseUrl}/verify/email/${email}`, {
          headers: {
            ...this.getHeaders('home'),
          },
        })
        .pipe(
          catchError((error: AxiosError) => {
            // The error is logged to the console
            this.logger.error(error.response.data);
            // If the error response is not found, an UnauthorizedException is thrown
            throw new UnauthorizedException(error.response.data);
          }),
        ),
    );

    // If the email is not found, an UnauthorizedException is thrown
    if (emailResponse !== 'ok') {
      throw new Error('Email not found');
    }

    // The captcha token is generated
    const token = await this.generateCaptchaToken();
    // The continue value is retrieved from the .env file
    const redirectTo = this.configService.get<string>('busha.authReferer');

    // The user is logged in using the Busha API
    const { data: loginResponse } = await firstValueFrom(
      this.httpService
        .post(
          `${bushaBaseUrl}/login`,
          {
            continue: redirectTo,
            email,
            password,
            remember_me: false,
            token,
          },
          {
            headers: {
              ...this.getHeaders('home'),
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            // The error is logged to the console
            this.logger.error(error.response.data);
            // If the error response is not found, an UnauthorizedException is thrown
            throw new UnauthorizedException(error.response.data);
          }),
        ),
    );

    // The confirmation_code and access_token values are retrieved from the loginResponse
    const { confirmation_code, access_token } = loginResponse;
    // if there's no existing user, create one
    if (!existingUser) {
      existingUser = await this.createAccount({
        email,
        confirmation_code: confirmation_code || 'auth_already_done',
      });
    }

    // If the access_token is found, the user is updated
    if (access_token) {
      return this.updateUser({ access_token, id: existingUser.id });
    }

    // The user is returned
    return existingUser;
  }

  // The confirmAccount() method confirms the user account
  async confirmAccount(payload: ValidateDto) {
    // The id and code values are retrieved from the payload
    const { id, code } = payload;
    // The user is retrieved from the Prisma client
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    // If the user is not found, an Error is thrown
    if (!user) {
      throw new Error('User not found');
    }

    // The confirmation_code value is retrieved from the user
    const { confirmation_code } = user;
    // The bushaBaseUrl configuration value is retrieved from the .env file
    const bushaBaseUrl = this.configService.get<string>('busha.baseUrl');

    // The continue value is retrieved from the .env file
    const redirectTo = this.configService.get<string>('busha.authReferer');

    // The user account is confirmed using the Busha API
    const { data: confirmResponse } = await firstValueFrom(
      this.httpService
        .post(
          `${bushaBaseUrl}/confirm`,
          {
            confirmation_code: code,
            continue: redirectTo,
          },
          {
            headers: {
              Authorization: `Bearer ${confirmation_code}`,
              ...this.getHeaders('home'),
            },
          },
        )
        .pipe(
          catchError((error: AxiosError) => {
            // The error is logged to the console
            this.logger.error(error.response.data);
            // If the error response is found, an UnauthorizedException is thrown
            if (error.response.data) {
              const { message } = error.response.data['error'];
              throw new UnauthorizedException(message);
            }
            throw new UnauthorizedException('Invalid code');
          }),
        ),
    );

    // The status is retrieved from the confirmResponse
    if (confirmResponse.status !== 'success') {
      // If the status is not success, an UnauthorizedException is thrown
      throw new UnauthorizedException('Invalid code');
    }

    // The user is updated
    return this.updateUser({ access_token: confirmResponse.access_token, id });
  }
}
