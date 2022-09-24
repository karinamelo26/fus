import { LinearProgress } from '@mui/material';
import styles from './LoadingBar.module.scss';
import { useRecoilValue } from 'recoil';
import { LoadingBarStateSelectors } from './loading-bar.state';
import classnames from 'classnames';

export function LoadingBar() {
  const isLoading = useRecoilValue(LoadingBarStateSelectors.getLoading);

  return (
    <div
      className={classnames({
        [styles.loading]: true,
        [styles.show]: isLoading,
      })}
    >
      <LinearProgress></LinearProgress>
    </div>
  );
}
