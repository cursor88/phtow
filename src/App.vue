<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style>
/*全局样式*/
page {
  background-color: #f5f7fa;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 28rpx;
  color: #333;
}

.container {
  padding: 24rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

.primary-btn {
  background: linear-gradient(135deg, #2d8b5e 0%, #3da878 100%);
  color: #fff;
  border-radius: 50rpx;
  font-size: 30rpx;
  padding: 20rpx 0;
  text-align: center;
  border: none;
}

.primary-btn::after {
  border: none;
}

.secondary-btn {
  background: #fff;
  color: #2d8b5e;
  border: 2rpx solid #2d8b5e;
  border-radius: 50rpx;
  font-size: 30rpx;
  padding: 18rpx 0;
  text-align: center;
}

.secondary-btn::after {
  border: none;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #2d8b5e;
  margin-bottom: 16rpx;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 6rpx;
  height: 28rpx;
  background: #2d8b5e;
  border-radius: 3rpx;
  margin-right: 12rpx;
}

.tag {
  display: inline-block;
  padding: 6rpx 16rpx;
  background: #e8f5ee;
  color: #2d8b5e;
  border-radius: 20rpx;
  font-size: 24rpx;
  margin-right: 12rpx;
  margin-bottom: 12rpx;
}

.text-muted {
  color: #999;
  font-size: 24rpx;
}
</style>
