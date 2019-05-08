<template>
  <div class="posts-container">
    <div class="post-filter">
      <section>
        <el-select v-model="tagValue" placeholder="请选择" @change="queryChange">
          <el-option
            v-for="(item,index) in category"
            :key="index"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
      </section>
      <section>
        <el-radio-group v-model="filterValue" @change="queryChange">
          <el-radio-button label="待审核"></el-radio-button>
          <el-radio-button label="全部"></el-radio-button>
        </el-radio-group>
      </section>
    </div>

    <ul class="post-list" v-if="postList.length>0">
      <li class="postItem" v-for="(post,index) in postList" :key="index">
        <div class="image" @click.stop="bigImageEvent(post.photoList[0].url)">
          <img :src="post.photoList.length>0?post.photoList[0].url:''" alt="">
        </div>
        <div class="postState">
          <el-tag>{{post.status|postStatus}}</el-tag>
          <el-tag v-if="post.censoring!==null" :type="post.censoring?'warning':'danger'">
            {{post.censoring?'审核中':'审核拒绝'}}
          </el-tag>
        </div>
        <div class="review">
          <el-button type="primary" @click.stop="postModerate(post.id,index,'accept')">通过</el-button>
          <el-button type="danger" @click.stop="postModerate(post.id,index,'reject')">拒绝</el-button>
        </div>
      </li>
    </ul>
    <section v-else>
      <el-alert
        title="暂时没有待审核帖子"
        type="warning"
        :closable="false"
        :center="true">
      </el-alert>
    </section>

    <el-dialog :visible.sync="bigImageDialog">
      <img width="100%" :src="bigImageUrl" alt="">
    </el-dialog>

    <el-dialog width="30%" :visible.sync="pushPending.dialog" title="推送到分类" custom-class="post-push-dialog">
      <el-tag size="small" v-for="(item,index) in category" :type="pushPending.categoryId===item.id?'success':'info'"
              :key="index" @click.stop="pushPending.categoryId=item.id;pushPending.categoryName=item.value">{{item.value}}
      </el-tag>

      <div slot="footer" class="dialog-footer">
        <el-button size="small" @click="pushPending.dialog = false">取消</el-button>
        <el-button size="small" type="primary" @click.stop="pushPost">确定</el-button>
      </div>

    </el-dialog>
  </div>
</template>

<script type="text/ecmascript-6">

  import gqlQuery from '@/api/graphql/query'
  import gqlMutation from '@/api/graphql/mutation'

  export default {
    name: 'Posts',
    data() {
      return {
        category: [],
        tagValue: '',
        filterDictionary: {
          '全部': 'all',
          '待审核': 'pending'
        },
        filterValue: '待审核',
        query: {
          pageIndex: 0,
          pageSize: 30
        },
        postList: [],
        bigImageUrl: '',
        bigImageDialog: false,
        pushPending: {
          postId: '',
          dialog: false,
          categoryId: '',
          categoryName:''
        }
      }
    },
    props: {},
    methods: {
      //获取标签
      getTags() {
        let tagsList = []
        if (!this.category.length) {
          this.$apollo
            .query({
              query: gqlQuery.site,
              variables: {
                id: 12306
              }
            })
            .then(response => {
              if (response.data.site.categoryList) {
                tagsList = response.data.site.categoryList
                for (let item of tagsList) {
                  if (item.slug === 'all') {
                    this.pushPending.categoryId = item.id
                    this.pushPending.categoryName=item.name;
                  }
                  this.category.push({ value: item.name, label: item.name, id: item.id })
                }
              }
            })
            .catch(error => {
              console.log(error)
            })
        }
      },

      /**
       * 获取列表数据
       * @param state 是否获取重新获取数据 true:获取新数据 false:滚动加载数据
       */
      getPosts(state) {

        let variables = {}
        if (state) {
          this.postList = []
          this.query.pageIndex = 0
          window.scroll(0, 0) //返回顶部
        }
        variables.offset = this.query.pageIndex * this.query.pageSize
        variables.size = this.query.pageSize
        variables.filter = this.filterDictionary[this.filterValue]
        this.tagValue ? variables.tag = this.tagValue : null

        this.$apollo
          .query({
            query: gqlQuery.postAdmin,
            variables: variables
          })
          .then(response => {
            this.buildPosts(response.data.postsAdmin)
          })
          .catch(error => {
            console.log(error)
          })
      },

      //筛选条件变化
      queryChange() {
        this.getPosts(true)
      },

      //处理数据
      buildPosts(posts) {
        let index = this.postList.length
        for (var i = 0; i < posts.length; i++) {
          posts[i].index = index
          this.postList.push(posts[i])
          index++
        }

      },

      //展示大图
      bigImageEvent(url) {
        this.bigImageUrl = url
        this.bigImageDialog = true
      },

      /**
       * 更改帖子状态
       * @param post_id 帖子ID
       * @param index 帖子下标
       * @param state 状态
       */
      postModerate(post_id, index, state) {
        let that
        that = this
        this.$apollo.mutate({
          mutation: gqlMutation.postCensor,
          variables: {
            postId: post_id,
            action: state
          }
        })
          .then((res) => {
            if (!res.data.error) {
              this.postList[index].censoring = res.data.postCensor.censoring
              this.postList[index].status = res.data.postCensor.status
              if (this.postList[index].censoring === false) {
                this.$message.success('审核已拒绝')
                return false
              }
              this.$message({
                message: '审核已通过',
                type: 'success',
                duration: 2000,
                onClose: () => {
                  that.pushPending.dialog = true
                  that.pushPending.postId = post_id
                }
              })

            }
          })
          .catch((error) => {

          })
      },

      //推送
      pushPost() {
        let that;
        that=this;
        this.$apollo.mutate({
          mutation: gqlMutation.postSetCategories,
          variables: {
            postId: this.pushPending.postId,
            categories: [this.pushPending.categoryId]
          }
        })
          .then((data, errors) => {
            if (errors) {
              return false
            }
            this.$message({
              message:`推送到${this.pushPending.categoryName}分类成功`,
              type:'success',
              duration:1000,
              onClose:()=>{
                that.pushPending.dialog=false;
              }
            });
          })
          .catch((error) => {

          })
      }
    },
    computed: {},
    components: {},
    filters: {
      postStatus(value) {
        let status
        switch (value) {
          case 'deleted':
            status = '已删除'
            break
          case 'private':
            status = '私密'
            break
          case 'public':
            status = '公开'
            break
        }
        return status
      }
    },
    created() {

    },
    mounted() {
      this.getTags()
      this.getPosts()
    }
  }
</script>
<style lang="scss" scoped>
  .posts-container {
    width: 100%;
    height: auto;
    padding: 10px;
    .post-filter {
      width: 100%;
      display: flex;
      margin-bottom: 20px;
      > section:nth-of-type(1) {
        margin-right: 15px;
      }
    }
    .post-list {
      width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-wrap: wrap;
      .postItem {
        position: relative;
        width: 292.5px;
        height: 300px;
        flex: 0 0 292.5px;
        margin: 0 10px 20px 0;
        cursor: pointer;
        &:nth-of-type(4n) {
          margin-right: 0;
        }
        .image {
          width: 100%;
          height: 240px;
          position: relative;
          overflow: hidden;
          > img {
            position: absolute;
            transform: translate3d(-50%, -50%, 0);
            left: 50%;
            top: 50%;
            width: auto;
            max-width: 100%;
            max-height: 100%;
          }
        }
        .postState {
          height: 24px;
          margin: 3px 0;
          .el-tag {
            height: 24px;
            line-height: 24px;
          }
        }
        .review {
          height: 30px;
          .el-button {
            height: 30px;
            padding: 0 20px;
            line-height: 30px;
            margin-right: 30px;
          }
        }
      }
    }
    .post-push-dialog {
      .el-tag {
        cursor: pointer;
        margin-right: 10px;
      }
    }
  }
</style>
