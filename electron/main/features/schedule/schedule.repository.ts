import { createRepository, Repository } from '../../di/repository';

@Repository()
export class ScheduleRepository extends createRepository('schedule') {}
