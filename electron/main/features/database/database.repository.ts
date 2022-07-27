import { createRepository, Repository } from '../../di/repository';

@Repository()
export class DatabaseRepository extends createRepository('database') {}
