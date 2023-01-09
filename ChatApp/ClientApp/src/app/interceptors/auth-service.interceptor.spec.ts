import { TestBed } from '@angular/core/testing';

import { AuthServiceInterceptor } from './auth-service.interceptor';

describe('AuthServiceInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AuthServiceInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: AuthServiceInterceptor = TestBed.inject(AuthServiceInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
