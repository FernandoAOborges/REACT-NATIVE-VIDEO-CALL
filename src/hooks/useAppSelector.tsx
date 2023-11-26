import { useSelector, TypedUseSelectorHook } from 'react-redux';

import { RootState } from '@/redux/store';

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default useAppSelector;
