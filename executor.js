/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var assert = require('assert');
var exitError = require('exit-error');
var spawnCommand = require('spawn-command');
var SshExec = require('nscale-util').sshexec;
var pipeChildStdioToOut = require('./pipe-child-stdio-to-out');

module.exports = function(config) {
  var executeLocal = function(cmd, out, cb) {
    var child = spawnCommand(cmd);
    pipeChildStdioToOut(child, out);
    child.on('exit', function(code, signal) {
      cb(exitError(cmd, code, signal));
    });
  };

  var executeRemote = function(ipAddress, cmd, out, cb) {
    var exec = new SshExec();
    // Just pass `live` here - we terminate `preview` earlier in the container
    // code.
    // FIXME: hard-coded user (we have no convention for passing remote username
    // yet).
    exec.exec('live', ipAddress, 'ubuntu', config.sshKeyPath, cmd, cb);
  };

  var exec = function(ipAddress, cmd, out, cb) {
    assert(cmd);
    if (!ipAddress || ipAddress === '127.0.0.1' || ipAddress === 'localhost') {
      return executeLocal(cmd, out, cb);
    }
    return executeRemote(ipAddress, cmd, out, cb);
  };

  assert(config);

  return {
    exec: exec
  };
};
