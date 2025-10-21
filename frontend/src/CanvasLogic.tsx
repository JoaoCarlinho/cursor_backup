import { kea } from 'kea';

export const canvasLogic = kea({
  path: ['frontend', 'components', 'appLogic'],
  actions: {
    setWidth: (width) => ({ width }),
    setHeight: (height) => ({ height }),
    setShowMasks: (show) => ({ show }),
  },
  reducers: {
    width: [
      800,
      {
        setWidth: (_, { width }) => width,
      },
    ],
    height: [
      800,
      {
        setHeight: (_, { height }) => height,
      },
    ],
    showMasks: [
      true,
      {
        setShowMasks:  (_, { show }) => show,
      },
    ],
  },
});