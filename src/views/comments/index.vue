<template>
  <section class="comment-container">
    <el-table
      :data="commentList"
    >
      <el-table-column
        prop="author.id"
        label="用户ID"
      >
      </el-table-column>
      <el-table-column
        prop="author.name"
        label="用户名"
      >
      </el-table-column>
      <el-table-column
        prop="content"
        label="评论内容"
      >
      </el-table-column>

      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="commentDelete(scope)">删除
          </el-button>
        </template>
      </el-table-column>

    </el-table>
  </section>
</template>

<script type="text/ecmascript-6">
  import gqlQuery from '@/api/graphql/query'
  import gqlMutation from '@/api/graphql/mutation'
  import { parseTime } from '@/utils/index'

  export default {
    name: 'comments',
    data() {
      return {
        commentList: []
      }
    },
    props: {},
    methods: {
      getComments() {
        this.$apollo
          .query({
            query: gqlQuery.comments
          })
          .then(({ data, errors }) => {
            if (errors) {
              return false
            }
            this.commentList = data.post.commentList
          })
          .catch(error => {
            console.log(error)
          })
      },

      commentDelete(scope) {
        let index, comment
        index = scope.$index
        comment = scope.row
        this.$confirm('确认删除此条评论?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          showClose: true,
          type: 'warning'
        }).then(() => {
          this.$apollo
            .mutate({
              mutation: gqlMutation.commentDelete,
              variables: {
                commentId: comment.id
              }
            })
            .then(response => {
              if (response.errors) {
                this.$message({
                  showClose: true,
                  message: '删除失败',
                  type: 'error'
                });
                return false;
              }
              this.commentList.splice(index, 1);
              this.$message({
                showClose: true,
                message: '删除成功',
                type: 'success'
              });
            })
            .catch(error => {
              this.$message({
                showClose: true,
                message: '删除失败',
                type: 'error'
              });
            });
        }).catch(() => {

        })
      }
    },
    computed: {},
    components: {},
    created() {

    },
    mounted() {
      this.getComments()
    }
  }
</script>

<style lang="scss" scoped>
  .comment-container {
    padding: 10px;
  }
</style>
