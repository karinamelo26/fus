import { createRepository, Repository } from '../../di/repository';

@Repository({ global: true })
export class QueryHistoryRepository extends createRepository('queryHistory') {}
