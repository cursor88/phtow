let serverFavorites = { herbs: [], matches: [] };
let serverFavsLoaded = false;

async function loadServerFavorites() {
  if (!isLoggedIn()) {
    serverFavsLoaded = false;
    return;
  }
  try {
    const res = await fetch(API_BASE + '/favorite/list/herb', {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.code === 0 && data.data) {
      serverFavorites.herbs = Array.isArray(data.data) ? data.data : data.data.map(item => item.target_id);
    }

    const res2 = await fetch(API_BASE + '/favorite/list/match', {
      headers: getAuthHeaders()
    });
    const data2 = await res2.json();
    if (data2.code === 0 && data2.data) {
      serverFavorites.matches = Array.isArray(data2.data) ? data2.data : data2.data.map(item => item.target_id);
    }

    serverFavsLoaded = true;
  } catch (e) {
    console.error('loadServerFavorites error:', e);
  }
}

function getCurrentFavorites() {
  if (isLoggedIn() && serverFavsLoaded) {
    return serverFavorites;
  }
  const fav = localStorage.getItem('favorites');
  return fav ? JSON.parse(fav) : { herbs: [], matches: [] };
}

function saveLocalFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
  if (typeof updateProfileStats === 'function') {
    updateProfileStats();
  }
}

async function syncLocalFavoritesToServer() {
  if (!isLoggedIn()) return;
  const localFav = getFavorites();
  if (!localFav.herbs.length && !localFav.matches.length) return;

  for (const id of localFav.herbs) {
    try {
      await fetch(API_BASE + '/favorite/toggle', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetType: 'herb', targetId: id })
      });
    } catch (e) {}
  }
  for (const id of localFav.matches) {
    try {
      await fetch(API_BASE + '/favorite/toggle', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ targetType: 'match', targetId: id })
      });
    } catch (e) {}
  }

  localStorage.removeItem('favorites');
  await loadServerFavorites();
  if (typeof updateProfileStats === 'function') updateProfileStats();
}

async function toggleHerbFavorite(herbId, showToastMsg = true) {
  if (!isLoggedIn()) {
    const favorites = getFavorites();
    const index = favorites.herbs.indexOf(herbId);
    if (index > -1) {
      favorites.herbs.splice(index, 1);
      if (showToastMsg) showToast('已取消收藏');
    } else {
      favorites.herbs.push(herbId);
      if (showToastMsg) showToast('已收藏');
    }
    saveFavorites(favorites);
    return favorites.herbs.includes(herbId);
  }

  try {
    const res = await fetch(API_BASE + '/favorite/toggle', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetType: 'herb', targetId: herbId })
    });
    const data = await res.json();
    if (data.code === 0) {
      if (data.data.isFavorited) {
        if (!serverFavorites.herbs.includes(herbId)) {
          serverFavorites.herbs.push(herbId);
        }
        if (showToastMsg) showToast('已收藏');
      } else {
        serverFavorites.herbs = serverFavorites.herbs.filter(id => id !== herbId);
        if (showToastMsg) showToast('已取消收藏');
      }
      if (typeof updateProfileStats === 'function') updateProfileStats();
      return data.data.isFavorited;
    } else if (data.code === 401) {
      showToast('请先登录');
      return false;
    } else {
      showToast(data.message || '操作失败');
      return isHerbFavorite(herbId);
    }
  } catch (e) {
    showToast('网络错误');
    return isHerbFavorite(herbId);
  }
}

async function toggleMatchFavorite(matchId, showToastMsg = true) {
  if (!isLoggedIn()) {
    const favorites = getFavorites();
    const index = favorites.matches.indexOf(matchId);
    if (index > -1) {
      favorites.matches.splice(index, 1);
      if (showToastMsg) showToast('已取消收藏');
    } else {
      favorites.matches.push(matchId);
      if (showToastMsg) showToast('已收藏');
    }
    saveFavorites(favorites);
    return favorites.matches.includes(matchId);
  }

  try {
    const res = await fetch(API_BASE + '/favorite/toggle', {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ targetType: 'match', targetId: matchId })
    });
    const data = await res.json();
    if (data.code === 0) {
      if (data.data.isFavorited) {
        if (!serverFavorites.matches.includes(matchId)) {
          serverFavorites.matches.push(matchId);
        }
        if (showToastMsg) showToast('已收藏');
      } else {
        serverFavorites.matches = serverFavorites.matches.filter(id => id !== matchId);
        if (showToastMsg) showToast('已取消收藏');
      }
      if (typeof updateProfileStats === 'function') updateProfileStats();
      return data.data.isFavorited;
    } else if (data.code === 401) {
      showToast('请先登录');
      return false;
    } else {
      showToast(data.message || '操作失败');
      return isMatchFavorite(matchId);
    }
  } catch (e) {
    showToast('网络错误');
    return isMatchFavorite(matchId);
  }
}

function isHerbFavorite(herbId) {
  return getCurrentFavorites().herbs.includes(herbId);
}

function isMatchFavorite(matchId) {
  return getCurrentFavorites().matches.includes(matchId);
}

function getFavorites() {
  return getCurrentFavorites();
}

function saveFavorites(favorites) {
  saveLocalFavorites(favorites);
}

const _origLoadCurrentUser = typeof loadCurrentUser === 'function' ? loadCurrentUser : null;
async function enhancedLoadCurrentUser() {
  const user = _origLoadCurrentUser ? await _origLoadCurrentUser() : null;
  if (user) {
    await syncLocalFavoritesToServer();
  }
  serverFavsLoaded = false;
  if (user) {
    await loadServerFavorites();
  }
  if (typeof updateProfileStats === 'function') updateProfileStats();
  if (typeof updateProfileHeader === 'function') updateProfileHeader();
  return user;
}

if (typeof loadCurrentUser === 'function') {
  loadCurrentUser = enhancedLoadCurrentUser;
}
