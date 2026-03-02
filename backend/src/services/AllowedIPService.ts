/**
 * @module services/AllowedIPService
 * @description Service for managing allowed IP addresses for security.
 */

import { injectable, inject } from 'tsyringe';
import { AllowedIPRepository } from '../repositories/AllowedIPRepository';
import { AllowedIPDTO, CreateAllowedIPDTO, UpdateAllowedIPDTO } from '../dtos';
import { NotFoundError, ConflictError, InternalServerError } from '../utils';

/**
 * Service for allowed IP management.
 * @class AllowedIPService
 */
@injectable()
export class AllowedIPService {
  constructor(
    @inject(AllowedIPRepository) private allowedIPRepository: AllowedIPRepository
  ) { }

  async getAllowedIPs(): Promise<AllowedIPDTO[]> {
    const ips = await this.allowedIPRepository.findAll();
    return ips.map(ip => new AllowedIPDTO(ip));
  }

  async getIPById(id: string): Promise<AllowedIPDTO> {
    const ip = await this.allowedIPRepository.findById(id);

    if (!ip) {
      throw new NotFoundError('IP não encontrado', 'IP_NOT_FOUND');
    }

    return new AllowedIPDTO(ip);
  }

  async createAllowedIP(dto: CreateAllowedIPDTO): Promise<AllowedIPDTO> {

    // Permite IP simples, prefixo (ex: 150.165.42.) ou CIDR (ex: 150.165.42.0/24)
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){0,3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;
    if (!ipRegex.test(dto.ip)) {
      throw new ConflictError('Formato de IP ou Faixa inválido. Use IP (1.2.3.4), Prefixo (1.2.3.) ou CIDR (1.2.3.0/24)', 'INVALID_IP_FORMAT');
    }

    const existingIP = await this.allowedIPRepository.findByIP(dto.ip);
    if (existingIP) {
      throw new ConflictError('Este IP já está cadastrado', 'IP_ALREADY_EXISTS');
    }

    const ip = await this.allowedIPRepository.create({
      ip: dto.ip,
      description: dto.description,
      active: true
    });

    return new AllowedIPDTO(ip);
  }

  async updateAllowedIP(id: string, dto: UpdateAllowedIPDTO): Promise<AllowedIPDTO> {
    const ip = await this.allowedIPRepository.findById(id);

    if (!ip) {
      throw new NotFoundError('IP não encontrado', 'IP_NOT_FOUND');
    }

    if (dto.description) ip.description = dto.description;
    if (dto.active !== undefined) ip.active = dto.active;

    const updated = await this.allowedIPRepository.update(id, ip);

    if (!updated) {
      throw new InternalServerError('Erro ao atualizar IP', 'UPDATE_ERROR');
    }

    return new AllowedIPDTO(updated);
  }

  async toggleIPStatus(id: string): Promise<AllowedIPDTO> {
    const ip = await this.allowedIPRepository.toggleIPStatus(id);

    if (!ip) {
      throw new NotFoundError('IP não encontrado', 'IP_NOT_FOUND');
    }

    return new AllowedIPDTO(ip);
  }

  async deleteAllowedIP(id: string): Promise<void> {
    const deleted = await this.allowedIPRepository.delete(id);

    if (!deleted) {
      throw new NotFoundError('IP não encontrado', 'IP_NOT_FOUND');
    }
  }

  async isIPAllowed(ip: string): Promise<boolean> {
    const activeAllowedIPs = await this.allowedIPRepository.findActiveIPs();

    // Se não houver IPs cadastrados ou ativos, permite todos (comportamento padrão)
    if (activeAllowedIPs.length === 0) {
      return true;
    }

    return activeAllowedIPs.some(allowed => {
      const pattern = allowed.ip;

      // 1. Caso CIDR (ex: 192.168.1.0/24)
      if (pattern.includes('/')) {
        try {
          const [range, bits] = pattern.split('/');
          const mask = ~((1 << (32 - parseInt(bits))) - 1);

          const ipNum = this.ipToLong(ip);
          const rangeNum = this.ipToLong(range);

          return (ipNum & mask) === (rangeNum & mask);
        } catch (e) {
          return false;
        }
      }

      // 2. Caso Prefixo (ex: 150.165.42.)
      if (pattern.endsWith('.')) {
        return ip.startsWith(pattern);
      }

      // 3. Caso IP exato (ex: 150.165.42.10)
      return ip === pattern;
    });
  }

  private ipToLong(ip: string): number {
    const parts = ip.split('.');
    return (
      (parseInt(parts[0]) << 24) |
      (parseInt(parts[1]) << 16) |
      (parseInt(parts[2]) << 8) |
      parseInt(parts[3])
    ) >>> 0;
  }
}
