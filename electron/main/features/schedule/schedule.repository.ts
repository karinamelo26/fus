import { createRepository, Repository } from '../../di/repository';

@Repository({ global: true })
export class ScheduleRepository extends createRepository('schedule') {}
