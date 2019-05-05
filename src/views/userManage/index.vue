<template>
  <div class="user-container">
    <el-table
      :data="userList"
    >
      <el-table-column
        prop="slug"
        label="用户ID"
        width="180">
      </el-table-column>
      <el-table-column
        prop="name"
        label="姓名"
        width="180">
      </el-table-column>
      <el-table-column
        prop="avatar"
        class-name="column-avatar"
        width="180"
        label="头像">
        <template slot-scope="{row}">
          <div class="image">
            <img :src="row.avatar" alt="">
          </div>
        </template>
      </el-table-column>

      <el-table-column
        prop="created_at"
        label="创建日期"
      >
        <template slot-scope="{row}">
          <span>{{row.createdAt | formatTime}}</span>
        </template>
      </el-table-column>

      <el-table-column
        label="标签"
        class-name="column-tag"
      >
        <template slot-scope="{row}">
          <el-tag size="medium" v-for="(item,index) in row.review_tags" :key="index">
            {{item}}
          </el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>

</template>

<script type="text/ecmascript-6">
  import gql from '@/api/graphql/query'
  import { parseTime } from '@/utils/index'

  export default {
    name: 'users',
    data() {
      return {
        userList: []
      }
    },
    props: {},
    methods: {
      getUsers() {
        this.$apollo
          .query({
            query: gql.users,
            variables: {
              offset: 0,
              size: 100
            }
          })
          .then(response => {
            if (!response.data.error) {
              this.userList = response.data.users
            }
          })
          .catch(error => {
            console.log(error)
          })
      }
    },
    computed: {},
    components: {},
    filters: {
      formatTime(value) {
        if (!value) {
          return ''
        }
        return parseTime(value, '{y}-{m}-{d} {h}:{i}')
      }
    },
    created() {

    },
    mounted() {
      this.getUsers()
    }
  }
</script>

<style lang="scss" scoped>
  .user-container {
    padding: 10px;
    .column-avatar {
      .image {
        width: 35px;
        height: 35px;
        > img {
          width: 100%;
          height: 100%;
        }
      }
    }
    .column-tag {
      .el-tag {
        margin-right: 10px;
      }
    }
  }
</style>
