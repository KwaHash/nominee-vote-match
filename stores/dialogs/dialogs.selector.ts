import { type RootState, useAppSelector } from '@/stores/store'

export const selectDialogs = (state: RootState) => state.dialogs

export const useDeleteDialog = () => {
  const dialogs = useAppSelector(selectDialogs)
  return dialogs.deleteDialog
}
