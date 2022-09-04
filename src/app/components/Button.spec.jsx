import { create } from 'react-test-renderer';
import { Button } from './Button';

describe('Button', () => {
  let component;

  beforeEach(() => {
    component = create(<Button id="teste">Teste</Button>);
  });

  it('should create', () => {
    expect(component).toBeDefined();
  });
});
