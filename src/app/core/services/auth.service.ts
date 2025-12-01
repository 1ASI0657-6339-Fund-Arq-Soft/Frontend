import { Injectable } from "@angular/core"
import { BehaviorSubject, Observable, throwError, of } from "rxjs"
import { map, switchMap, catchError } from 'rxjs/operators'
import type { User, AuthResponse, LoginRequest, RegisterRequest } from "../models/user.model"
import { IamApiService } from './iam-api.service'
import { ResidentsApiService } from './residents-api.service'
import { UsersApiService } from './users-api.service'
import type { AuthenticatedUserResource, SignInResource, SignUpResource } from '../models/generated/iam.types'

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null)
  public currentUser$ = this.currentUserSubject.asObservable()

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false)
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable()



  constructor(
    private iam: IamApiService, 
    private residentsApi: ResidentsApiService,
    private usersApi: UsersApiService
  ) {
    this.loadUserFromStorage()
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.iam.signIn({ username: request.email, password: request.password }).pipe(
      map((res: AuthenticatedUserResource) => {
        // AuthenticatedUserResource currently doesn't include roles in the OpenAPI spec.
        // Default to 'familiar' when no role information is available from the sign-in response.
        const user: User = { id: String(res.id ?? ''), email: res.username ?? '', name: res.username ?? '', role: 'familiar' }
        const auth: AuthResponse = { user, token: res.token ?? '' }
        this.setCurrentUser(auth.user, auth.token)
        return auth
      })
    )
  }

  // Use remote IAM service to sign-in (returns token from backend)
  signInRemote(request: SignInResource): Observable<AuthResponse> {
    console.log('AuthService.signInRemote called with:', request)
    console.log('Using direct IAM signin + user lookup for roles')
    return this.iam.signIn(request).pipe(
      switchMap((authRes: AuthenticatedUserResource) => {
        console.log('Signin successful, fetching user details for ID:', authRes.id)
        // Get user details including roles
        return this.iam.getUsers().pipe(
          switchMap(users => {
            const foundUser = users.find(u => u.id === authRes.id)
            if (!foundUser) {
              throw new Error('User details not found after signin')
            }
            
            // Extract role from user data
            const rawRole = (foundUser.roles && foundUser.roles.length > 0) ? 
              foundUser.roles[0].replace('ROLE_', '').toLowerCase() : 'familiar'
            
            const safeRole = (['familiar', 'cuidador', 'doctor'].includes(rawRole)) ? 
              rawRole as User['role'] : 'familiar'
            
            let user: User = { 
              id: String(authRes.id ?? ''), 
              email: authRes.username ?? '', 
              name: authRes.username ?? '', 
              role: safeRole 
            }
            
            // Si es familiar, buscar su familyMemberId y linkedResidentId
            if (safeRole === 'familiar') {
              console.log('[AuthService] Usuario familiar detectado, buscando datos adicionales...');
              return this.usersApi.getAllFamilyMembers().pipe(
                map(familyMembers => {
                  // Buscar familiar por email (username)
                  const familyMember = familyMembers.find(fm => 
                    fm.contactEmail?.phone === authRes.username ||
                    fm.fullName?.firstName?.toLowerCase().includes(authRes.username?.toLowerCase() || '') ||
                    fm.fullName?.lastName?.toLowerCase().includes(authRes.username?.toLowerCase() || '')
                  );
                  
                  if (familyMember) {
                    console.log('[AuthService] Familiar encontrado:', familyMember);
                    user.familyMemberId = familyMember.id;
                    user.linkedResidentId = familyMember.linkedResidentId;
                    user.name = `${familyMember.fullName?.firstName || ''} ${familyMember.fullName?.lastName || ''}`.trim();
                  } else {
                    console.warn('[AuthService] No se encontró el familiar en el microservicio de usuarios');
                  }
                  
                  const auth: AuthResponse = { user, token: authRes.token ?? '' };
                  this.setCurrentUser(auth.user, auth.token);
                  console.log('Authentication complete:', { userId: user.id, role: user.role, hasToken: !!auth.token, familyMemberId: user.familyMemberId });
                  return auth;
                }),
                catchError(error => {
                  console.error('[AuthService] Error al buscar datos del familiar:', error);
                  // Continuar con usuario básico si falla
                  const auth: AuthResponse = { user, token: authRes.token ?? '' };
                  this.setCurrentUser(auth.user, auth.token);
                  return of(auth);
                })
              );
            } else {
              // Para otros roles, continuar normalmente
              const auth: AuthResponse = { user, token: authRes.token ?? '' }
              this.setCurrentUser(auth.user, auth.token)
              console.log('Authentication complete:', { userId: user.id, role: user.role, hasToken: !!auth.token })
              return of(auth);
            }
          })
        )
      }),
      catchError((error) => {
        console.error('SignIn process failed:', error)
        return throwError(() => error)
      })
    )
  }

  signUpRemote(request: SignUpResource): Observable<AuthResponse> {
    // Create user then auto-signin to get token (backend now works correctly)
    return this.iam.signUp(request).pipe(
      switchMap(() => this.signInRemote({ username: request.username || '', password: request.password || '' }))
    )
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    console.log('⭐⭐⭐ NUEVA VERSION DEL CODIGO SE ESTA EJECUTANDO ⭐⭐⭐');
    console.log('[AuthService] 🚀 Iniciando registro completo:', request);
    console.log('[AuthService] 🔍 Verificando condiciones:');
    console.log('[AuthService] - Role:', request.role, '=== "familiar"?', request.role === 'familiar');
    console.log('[AuthService] - ResidentName:', request.residentName, 'existe?', !!request.residentName);
    
    const roleMapping = {
      'familiar': 'ROLE_FAMILIAR',
      'cuidador': 'ROLE_CUIDADOR',
      'doctor': 'ROLE_DOCTOR'
    }
    
    // 1. Crear usuario en IAM
    return this.iam.signUp({ 
      username: request.email, 
      password: request.password,
      roles: [roleMapping[request.role as keyof typeof roleMapping]]
    }).pipe(
      switchMap((userResource) => {
        console.log('[AuthService] Usuario IAM creado:', userResource);
        console.log('[AuthService] ⭐ EJECUTANDO LOGICA DE SWITCHMAP');
        console.log('[AuthService] ⭐ ROLE ES:', request.role);
        console.log('[AuthService] ⭐ RESIDENT NAME ES:', request.residentName);
        
        // Si es familiar, crear también el residente y el familiar
        if (request.role === 'familiar' && request.residentName) {
          console.log('[AuthService] ⭐⭐⭐ ENTRANDO EN CREACION DE RESIDENTE');
          console.log('[AuthService] 📝 Creando residente y familiar...');
          console.log('[AuthService] 🔍 Datos del residente a crear:', request);
          
          // Calcular fecha de nacimiento si no se proporcionó
          let birthDate = request.residentBirthDate;
          if (!birthDate && request.residentAge) {
            const currentYear = new Date().getFullYear();
            const birthYear = currentYear - parseInt(request.residentAge);
            birthDate = `${birthYear}-01-01T00:00:00Z`;
          }
          
          // Asegurar formato de fecha correcto para el backend
          if (birthDate && !birthDate.includes('T')) {
            birthDate = new Date(birthDate).toISOString();
          }
          
          // 2. Crear residente
          const residentData = {
            dni: request.residentDni || this.generateTempDni(),
            firstName: request.residentName?.split(' ')[0] || request.residentName || 'Nombre',
            lastName: request.residentName?.split(' ').slice(1).join(' ') || 'Apellido',
            birthDate: birthDate || '1950-01-01T00:00:00Z',
            gender: request.residentGender || 'No especificado',
            street: request.residentStreet || 'Dirección no especificada',
            city: request.residentCity || 'Ciudad no especificada',
            state: request.residentState || 'Estado no especificado',
            country: request.residentCountry || 'Perú',
            zipCode: request.residentZipCode || '00000',
            receiptId: 1
          };
          
          // Validar que todos los campos requeridos estén presentes
          console.log('[AuthService] 🔍 Validando campos requeridos:');
          const requiredFields = ['dni', 'firstName', 'lastName', 'street', 'city', 'state', 'country', 'zipCode', 'gender', 'birthDate', 'receiptId'];
          requiredFields.forEach(field => {
            const value = (residentData as any)[field];
            console.log(`  - ${field}: ${value} (${typeof value}) - ${value ? 'Valid' : 'Invalid'}`);
          });
          
          console.log('[AuthService] 🏠 Datos del residente preparados:', residentData);
          console.log('[AuthService] 📡 Llamando a residentsApi.create()...');
          
          return this.residentsApi.create(residentData).pipe(
            switchMap((resident) => {
              console.log('[AuthService] Residente creado:', resident);
              
              // 3. Crear familiar vinculado al residente
              const familyMemberData = {
                relationship: request.relationship || 'Familiar',
                linkedResidentId: resident.id,
                fullName: {
                  firstName: request.name.split(' ')[0] || request.name,
                  lastName: request.name.split(' ').slice(1).join(' ') || 'Apellido'
                },
                contactInfo: {
                  phone: request.phone || '',
                  email: request.email
                }
              };
              
              return this.usersApi.createFamilyMember(familyMemberData).pipe(
                map((familyMember) => {
                  console.log('[AuthService] Familiar creado:', familyMember);
                  console.log('[AuthService] 🎉 Registro completo exitoso!');
                  
                  const user: User = { 
                    id: String(userResource.id ?? ''), 
                    email: userResource.username ?? '', 
                    name: request.name, 
                    role: request.role,
                    familyMemberId: familyMember.id,
                    linkedResidentId: resident.id
                  }
                  
                  return { user, token: '' };
                })
              );
            })
          );
        } else if (request.role === 'doctor' && request.licenseNumber && request.specialty) {
          console.log('[AuthService] ⭐⭐⭐ ENTRANDO EN CREACION DE DOCTOR');
          console.log('[AuthService] Creando doctor...');
          console.log('[AuthService] 🔍 Datos del doctor a crear:', request);
          
          // Crear doctor en microservicio de usuarios
          const doctorData = {
            licenseNumber: request.licenseNumber,
            specialty: request.specialty,
            fullName: {
              firstName: request.name.split(' ')[0] || request.name,
              lastName: request.name.split(' ').slice(1).join(' ') || 'Apellido'
            },
            contactInfo: {
              phone: request.doctorPhone || '',
              address: {
                street: request.doctorStreet || 'Dirección no especificada',
                city: request.doctorCity || 'Ciudad no especificada',
                state: request.doctorState || 'Estado no especificado',
                zipCode: request.doctorZipCode || '00000',
                country: request.doctorCountry || 'Perú'
              }
            }
          };
          
          console.log('[AuthService] 🏥 Datos del doctor preparados:', doctorData);
          console.log('[AuthService] 📡 Llamando a usersApi.createDoctor()...');
          
          return this.usersApi.createDoctor(doctorData).pipe(
            map((doctor) => {
              console.log('[AuthService] Doctor creado:', doctor);
              console.log('[AuthService] 🎉 Registro de doctor completo exitoso!');
              
              const user: User = { 
                id: String(userResource.id ?? ''), 
                email: userResource.username ?? '', 
                name: request.name, 
                role: request.role 
              }
              
              return { user, token: '' };
            })
          );
        } else {
          // Para otros roles, solo crear el usuario
          console.log('[AuthService] ⭐⭐⭐ ENTRANDO EN ELSE - REGISTRO BASICO');
          console.log('[AuthService] Registro básico para rol:', request.role);
          console.log('[AuthService] Registro básico completado para rol:', request.role);
          const user: User = { 
            id: String(userResource.id ?? ''), 
            email: userResource.username ?? '', 
            name: request.name, 
            role: request.role 
          }
          return of({ user, token: '' });
        }
      }),
      catchError((error) => {
        console.error('[AuthService] Error en registro:', error);
        return throwError(() => error);
      })
    )
  }

  private generateTempDni(): string {
    // Genera un DNI temporal único
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  logout(): void {
    localStorage.removeItem("currentUser")
    localStorage.removeItem("authToken")
    this.currentUserSubject.next(null)
    this.isAuthenticatedSubject.next(false)
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value
  }

  getToken(): string | null {
    return localStorage.getItem("authToken")
  }

  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value
  }

  private setCurrentUser(user: User, token: string): void {
    localStorage.setItem("currentUser", JSON.stringify(user))
    localStorage.setItem("authToken", token)
    this.currentUserSubject.next(user)
    this.isAuthenticatedSubject.next(true)
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        this.currentUserSubject.next(user)
        this.isAuthenticatedSubject.next(true)
      } catch (e) {
        console.error("Error loading user from storage:", e)
        this.logout()
      }
    }
  }



  getAllUsers(): Observable<User[]> {
    return this.iam.getUsers().pipe(
      map(userResources => userResources.map(res => {
        const rawRole = (res.roles && res.roles.length > 0) ? res.roles[0] : 'familiar'
        const safeRole = (rawRole === 'familiar' || rawRole === 'cuidador' || rawRole === 'doctor') ? rawRole : 'familiar'
        return {
          id: String(res.id ?? ''),
          email: res.username ?? '',
          name: res.username ?? '',
          role: safeRole as User['role']
        }
      }))
    )
  }

  getFamiliares(): Observable<User[]> {
    return this.getAllUsers().pipe(
      map(users => users.filter(u => u.role === 'familiar'))
    )
  }


}
