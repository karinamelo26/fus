import { createRepository, Repository } from '../../di/repository';

@Repository({ global: true })
export class DatabaseRepository extends createRepository('database') {}
