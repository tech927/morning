class AppState {
  constructor() {
    this.token = localStorage.getItem('token');
    this.user = JSON.parse(localStorage.getItem('user') || 'null');
    this._listeners = [];
  }

  setState(newState) {
    Object.assign(this, newState);
    
    // Persist to localStorage
    if (newState.token !== undefined) {
      if (newState.token) {
        localStorage.setItem('token', newState.token);
      } else {
        localStorage.removeItem('token');
      }
    }
    
    if (newState.user !== undefined) {
      if (newState.user) {
        localStorage.setItem('user', JSON.stringify(newState.user));
      } else {
        localStorage.removeItem('user');
      }
    }

    // Notify listeners
    this._listeners.forEach(listener => listener(this));
  }

  subscribe(listener) {
    this._listeners.push(listener);
    return () => {
      this._listeners = this._listeners.filter(l => l !== listener);
    };
  }
}

export const state = new AppState();

export const setUser = (userData, token) => {
  state.setState({
    user: userData,
    token: token
  });
};

export const logout = () => {
  state.setState({
    user: null,
    token: null
  });
};

export const updateUser = (userData) => {
  state.setState({
    user: { ...state.user, ...userData }
  });
};
